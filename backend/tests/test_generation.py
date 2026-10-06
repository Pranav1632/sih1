"""
backend/tests/test_generation.py - Unit tests for Role #3 LLM/Prompt Engineer.
Validates all 7 Pydantic schemas, prompt builders, and generator node execution.
"""

import json
import pytest
from pathlib import Path

from backend.models.formats import (
    LinkedInSchema,
    TweetItem,
    TwitterThreadSchema,
    AdvisorySchema,
    ExecSummarySchema,
    Slide,
    PresentationSchema,
    Scene,
    VideoPackageSchema,
    InfographicSection,
    InfographicSchema,
)
from backend.generation.prompts import (
    build_prompt_for_format,
    format_source_chunks_context,
    format_parameters_context,
    FORMAT_SYSTEM_PROMPTS,
)
from backend.generation.generator_node import (
    run_parallel_format_generation,
    generate_single_format,
    normalize_format_key,
    SCHEMA_MAP,
)
from backend.orchestration.state import get_empty_agent_state


FIXTURE_CHUNKS_PATH = Path(__file__).resolve().parent.parent.parent / "fixtures" / "mock_source_chunks.json"


@pytest.fixture
def sample_source_chunks():
    if FIXTURE_CHUNKS_PATH.exists():
        with open(FIXTURE_CHUNKS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return [
        {
            "chunk_id": "doc_01_chunk_01",
            "doc_id": "doc_01",
            "source_name": "GhostLatch_Incident_Report.pdf",
            "source_role": "PRIMARY",
            "page_number": 1,
            "char_start": 0,
            "char_end": 250,
            "text": "An unpatched firmware vulnerability was exploited to gain unauthorized access to substation control software.",
            "extracted_entities": [{"text": "Directorate of Power Grid Resilience", "label": "ORG"}],
        }
    ]


class TestPydanticSchemas:
    """Task 1: Validate all 7 Pydantic schemas field-for-field and JSON schema generation."""

    def test_linkedin_schema(self):
        schema = LinkedInSchema(
            headline="Incident Contained: Grid Resilience Restored",
            opening_hook="Two endpoints compromised. Zero data egress.",
            body_paragraphs=["Comprehensive investigation underway.", "Remediation verified."],
            key_takeaways=["Patch immediately", "Audit scheduled tasks"],
            call_to_action="Read our advisory.",
            hashtags=["#CyberSecurity", "#GridResilience"],
            cited_chunk_ids=["chunk_1"],
        )
        assert schema.headline.startswith("Incident Contained")
        json_schema = LinkedInSchema.model_json_schema()
        assert "headline" in json_schema["properties"]
        assert "body_paragraphs" in json_schema["properties"]
        assert "cited_chunk_ids" in json_schema["properties"]

    def test_twitter_schema(self):
        tweet1 = TweetItem(tweet_number=1, content="1/2 Alert: New security advisory.", character_count=32)
        tweet2 = TweetItem(tweet_number=2, content="2/2 Patch your firmware now.", character_count=27)
        thread = TwitterThreadSchema(
            thread_title="Grid Advisory Thread",
            total_tweets=2,
            tweets=[tweet1, tweet2],
            cited_chunk_ids=["chunk_1"],
        )
        assert thread.total_tweets == 2
        assert len(thread.tweets) == 2
        assert thread.tweets[0].content.startswith("1/2")
        json_schema = TwitterThreadSchema.model_json_schema()
        assert "tweets" in json_schema["properties"]

    def test_advisory_schema(self):
        advisory = AdvisorySchema(
            advisory_id="NTRO-ADV-2026-09",
            title="Firmware Exploit in Substation Control",
            severity_level="HIGH",
            threat_overview="Unauthorized lateral access to control software.",
            affected_systems=["Substation Control Endpoints"],
            indicators_of_compromise=["CVE-2026-XXXX"],
            recommended_mitigations=["Apply vendor patch", "Isolate endpoints"],
            compliance_and_governance="Report within 24 hours.",
            cited_chunk_ids=["chunk_1", "chunk_2"],
        )
        assert advisory.advisory_id == "NTRO-ADV-2026-09"
        assert len(advisory.recommended_mitigations) == 2
        json_schema = AdvisorySchema.model_json_schema()
        assert "indicators_of_compromise" in json_schema["properties"]

    def test_exec_summary_schema(self):
        exec_sum = ExecSummarySchema(
            situation_overview="Situational overview paragraph for leadership.",
            core_findings=["Finding 1", "Finding 2"],
            strategic_impact="Low financial risk, high operational awareness.",
            decisions_required=["Authorize patch deployment"],
            confidence_assessment="HIGH",
            cited_chunk_ids=["chunk_1"],
        )
        assert exec_sum.confidence_assessment == "HIGH"
        json_schema = ExecSummarySchema.model_json_schema()
        assert "decisions_required" in json_schema["properties"]

    def test_presentation_schema(self):
        slide = Slide(
            slide_number=1,
            title="Overview",
            bullet_points=["Point A", "Point B"],
            visual_guidance="Split view",
            speaker_notes="Good morning team.",
            slide_reference_citations=["chunk_1"],
        )
        deck = PresentationSchema(
            deck_title="Threat Briefing",
            target_audience="Executive Leadership",
            slides=[slide],
        )
        assert len(deck.slides) == 1
        json_schema = PresentationSchema.model_json_schema()
        assert "slides" in json_schema["properties"]

    def test_video_package_schema(self):
        scene = Scene(
            scene_number=1,
            duration_seconds=15,
            visual_description="Opening title card",
            narration_voiceover="Welcome to the briefing.",
            on_screen_subtitles="BRIEFING START",
            music_sound_cues="Low synth hum",
        )
        pkg = VideoPackageSchema(
            video_title="Incident Briefing Video",
            target_duration="60s",
            logline="Summary of grid incident",
            scenes=[scene],
            cited_chunk_ids=["chunk_1"],
        )
        assert len(pkg.scenes) == 1
        json_schema = VideoPackageSchema.model_json_schema()
        assert "scenes" in json_schema["properties"]

    def test_infographic_schema(self):
        section = InfographicSection(
            section_order=1,
            header="Key Metric",
            key_statistic_or_callout="0 KB EGRESS",
            descriptive_copy="No data leaked.",
            recommended_chart_type="Metric Card",
        )
        info = InfographicSchema(
            infographic_title="Cyber Defense Infographic",
            central_theme="Grid Defense",
            sections=[section],
            cited_chunk_ids=["chunk_1"],
        )
        assert len(info.sections) == 1
        json_schema = InfographicSchema.model_json_schema()
        assert "sections" in json_schema["properties"]


class TestPromptGeneration:
    """Task 2: Validate prompt builders and format instructions."""

    def test_all_format_prompts_configured(self):
        expected_formats = ["linkedin", "twitter", "advisory", "exec_summary", "presentation", "video", "infographic"]
        for fmt in expected_formats:
            assert fmt in FORMAT_SYSTEM_PROMPTS
            assert "CARDINAL PRINCIPLES" in FORMAT_SYSTEM_PROMPTS[fmt]

    def test_build_prompt_for_format(self, sample_source_chunks):
        parameters = {
            "tone": "Authoritative",
            "target_audience": "Defense Leadership",
            "detail_level": "High",
            "communication_objective": "Direct Incident Remediation",
        }
        bundle = build_prompt_for_format("advisory", sample_source_chunks, parameters)
        assert bundle["format_key"] == "advisory"
        assert "OPERATOR MISSION PARAMETERS" in bundle["user"]
        assert "Authoritative" in bundle["user"]
        assert "GhostLatch_Incident_Report.pdf" in bundle["user"] or "doc_01_chunk_01" in bundle["user"]


class TestGeneratorNode:
    """Task 3: Validate generator node execution and AgentState output."""

    def test_normalize_format_keys(self):
        assert normalize_format_key("LinkedIn") == "linkedin"
        assert normalize_format_key("Twitter_Thread") == "twitter"
        assert normalize_format_key("PPTX") == "presentation"
        assert normalize_format_key("video_package") == "video"
        assert normalize_format_key("executive_summary") == "exec_summary"

    def test_generate_single_format(self, sample_source_chunks):
        out = generate_single_format("advisory", sample_source_chunks, {"tone": "Strict"})
        assert isinstance(out, dict)
        assert "advisory_id" in out
        assert "severity_level" in out
        assert "recommended_mitigations" in out
        assert len(out["recommended_mitigations"]) >= 2
        assert "cited_chunk_ids" in out

    def test_generate_single_format_with_temperature(self, sample_source_chunks):
        # Validate that custom temperature parameter (0.0 strictly deterministic) is accepted and processed
        out = generate_single_format(
            "advisory",
            sample_source_chunks,
            {"tone": "Strict", "temperature": 0.0}
        )
        assert isinstance(out, dict)
        assert "advisory_id" in out
        assert "recommended_mitigations" in out

    def test_run_parallel_format_generation_all_seven_formats(self, sample_source_chunks):
        state = get_empty_agent_state(job_id="test_gen_job_001")
        state["source_chunks"] = sample_source_chunks
        state["parameters"] = {
            "tone": "Authoritative",
            "target_audience": "Defense Leadership",
            "detail_level": "High",
        }
        state["requested_formats"] = [
            "linkedin",
            "twitter",
            "advisory",
            "exec_summary",
            "presentation",
            "video",
            "infographic",
        ]

        updated_state = run_parallel_format_generation(state)
        drafts = updated_state["draft_outputs"]

        # Validate all 7 formats produced
        for fmt in ["linkedin", "twitter", "advisory", "exec_summary", "presentation", "video", "infographic"]:
            assert fmt in drafts, f"Format {fmt} missing from draft_outputs"
            # Validate output adheres to corresponding Pydantic schema
            schema_cls = SCHEMA_MAP[fmt]
            validated = schema_cls.model_validate(drafts[fmt])
            assert validated is not None
            assert len(drafts[fmt].get("cited_chunk_ids", [])) > 0 or hasattr(validated, "slides")
