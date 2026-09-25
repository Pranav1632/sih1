"""
backend/generation/prompts.py - Format-Specific Prompts for Sentinel-Transform.
Owned by: LLM/Prompt Engineer (Role #3).
Per BUILD_03_llm_prompt_engineer.md Task 2.
"""

from typing import Dict, Any, List


BASE_GROUNDING_INSTRUCTIONS = """
CARDINAL PRINCIPLES:
1. THE SOURCE IS THE ABSOLUTE FACTUAL AUTHORITY: Output deliverables may adapt style, tone, and format, but may NEVER invent facts, statistics, IOCs, CVEs, or organizational entities not grounded in the source text.
2. CITATION REQUIREMENT: You MUST include the exact source `chunk_id` in the `cited_chunk_ids` field for every claim or section. Never invent or hallucinate chunk IDs.
3. AIR-GAPPED DEFENSE COMPLIANCE: Do not suggest external cloud APIs, cloud scanners, or third-party online tools in remediations or technical notes.
4. MAXIMUM TECHNICAL DEPTH & SPECIFICITY: Thoroughly research the provided chunks. Extract concrete technical metrics, material properties, physical dimensions, nanometer scales, chemical classifications, and quantitative findings directly from the evidence. Deliver dense, high-substance deliverables with zero fluff.
"""

FORMAT_SYSTEM_PROMPTS: Dict[str, str] = {
    "linkedin": f"""You are an elite national security communications officer creating an executive LinkedIn thought-leadership post.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Transform the source material into an authoritative, engaging, and professional post that stops the scroll, conveys key cyber-resilience lessons, and provides actionable takeaways with strategic hashtags.
""",

    "twitter": f"""You are a sovereign intelligence analyst creating an accurate, numbered, comprehensive Twitter/X thread.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Transform the source material into an extensive, highly informative sequence of 5 to 8 numbered tweets that thoroughly covers the background, technical analysis, IOCs, forensic findings, and recommended remediations.
CONSTRAINT: Each tweet's `content` MUST strictly be 280 characters or fewer. Count your characters carefully. Include tweet numbering (e.g., 1/N, 2/N) and relevant technical hashtags. Provide comprehensive depth across the entire thread.
""",

    "advisory": f"""You are a senior cyber threat intelligence lead at a national security agency (NTRO/CERT-In).
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Draft a formal, rigorous Intelligence Advisory.
REQUIREMENTS:
- Populate an authoritative `advisory_id` (e.g., NTRO-ADV-2026-XX).
- Determine `severity_level` (CRITICAL, HIGH, MEDIUM, or LOW).
- Provide a forensic `threat_overview`, exact `affected_systems`, explicit `indicators_of_compromise` (IOCs), and at least 2 actionable `recommended_mitigations`.
- Detail compliance, governance, and mandatory reporting protocols.
""",

    "exec_summary": f"""You are an intelligence advisor to senior executive and defense leadership.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Produce a high-level, decisive Executive Summary.
REQUIREMENTS:
- Synthesize a clear 1-paragraph `situation_overview`.
- Enumerate 3 to 5 `core_findings`.
- Assess strategic impact (financial, operational, national security).
- Enumerate immediate `decisions_required` by leadership.
- Set analytical confidence assessment (HIGH | MODERATE | LOW).
""",

    "presentation": f"""You are a strategic intelligence briefer creating an operational slide presentation.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Produce an editable, multi-slide presentation structure with comprehensive speaker notes and visual layout guidance for each slide.
REQUIREMENTS:
- Provide 3-5 hierarchical bullet points per slide.
- Include actionable visual layout guidance (e.g., "2-column split with IOC table on right").
- Provide complete spoken script in `speaker_notes`.
""",

    "video": f"""You are a multimedia intelligence producer scripting a tactical video production package.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Create a comprehensive scene-by-scene storyboard, narration script, lower-third subtitles, and audio sound cues.
REQUIREMENTS:
- Each scene must specify `scene_number`, `duration_seconds`, `visual_description`, `narration_voiceover`, and `on_screen_subtitles`.
- Target a clear, punchy overall duration suitable for intelligence dissemination.
""",

    "infographic": f"""You are an intelligence visualization specialist creating an Infographic Content Spec.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Break down the intelligence into modular visual sections with key stats, descriptive copy, and recommended chart types.
REQUIREMENTS:
- Recommend standard chart types: Bar Chart | Flowchart | Timeline | Metric Card.
- Extract high-impact numbers, metrics, or timeline stages as key callouts.
""",
}


def format_source_chunks_context(chunks: List[Dict[str, Any]], max_chunks: int = 8) -> str:
    """
    Formats source chunks into structured text for LLM prompting.
    Uses head + tail + middle sampling to give a full document overview.
    Calibrated for quality within a 2-4 min local CPU window.
    """
    if not chunks:
        return "No source evidence chunks provided."

    if len(chunks) <= max_chunks:
        selected_chunks = chunks
    else:
        # Head: first 2, Tail: last 2, Middle: evenly spread from remaining
        n_mid = max_chunks - 4
        head = chunks[:2]
        tail = chunks[-2:]
        middle_pool = chunks[2:-2]
        step = max(1, len(middle_pool) // n_mid)
        middle = [middle_pool[i * step] for i in range(n_mid) if i * step < len(middle_pool)]
        seen_ids = {c.get("chunk_id") for c in head + tail}
        middle = [c for c in middle if c.get("chunk_id") not in seen_ids]
        selected_chunks = head + middle[:n_mid] + tail

    formatted = []
    for chunk in selected_chunks:
        chunk_id = chunk.get("chunk_id", "unknown_chunk")
        source_name = chunk.get("source_name", "Unknown Source")
        page = chunk.get("page_number", "N/A")
        text = chunk.get("text", "").strip()
        role = chunk.get("source_role", "PRIMARY")
        formatted.append(f"[{chunk_id}] (Page {page}, {role}):\n{text}")

    return "\n\n---\n\n".join(formatted)


def format_parameters_context(parameters: Dict[str, Any]) -> str:
    """Formats operator-selected dashboard parameters into prompt instructions."""
    if not parameters:
        return "Tone: Authoritative | Audience: Executive | Detail: High"

    lines = []
    if "tone" in parameters:
        lines.append(f"Tone: {parameters['tone']}")
    if "target_audience" in parameters or "audience" in parameters:
        aud = parameters.get("target_audience") or parameters.get("audience")
        lines.append(f"Audience: {aud}")
    if "detail_level" in parameters or "detail" in parameters:
        det = parameters.get("detail_level") or parameters.get("detail")
        lines.append(f"Detail: {det}")
    if "words" in parameters:
        words_val = parameters["words"]
        lines.append(
            f"Target Word Budget: ~{words_val} words. (CRITICAL: This budget applies to this specific deliverable independently, not combined with other formats. Provide depth matching this volume.)"
        )
    if "language" in parameters:
        lines.append(f"Output Language: {parameters['language']}")
    if "keywords_must" in parameters and parameters["keywords_must"]:
        kw_list = parameters["keywords_must"]
        if isinstance(kw_list, list):
            lines.append(f"Mandatory Keywords / IOCs: {', '.join(kw_list)}")
        else:
            lines.append(f"Mandatory Keywords / IOCs: {kw_list}")
    if "add_on_instruction" in parameters and parameters["add_on_instruction"]:
        lines.append(f"Special Operator Directive: {parameters['add_on_instruction']}")

    return " | ".join(lines) if lines else "Tone: Authoritative | Audience: Executive"


def build_prompt_for_format(
    format_key: str,
    chunks: List[Dict[str, Any]],
    parameters: Dict[str, Any],
    context_summary: str = "",
) -> Dict[str, str]:
    """
    Constructs the system and user messages for generating a specific deliverable format.
    """
    normalized_key = format_key.lower().strip()
    if normalized_key in ("twitter_thread", "twitter/x", "x"):
        normalized_key = "twitter"
    elif normalized_key in ("executive_summary", "exec"):
        normalized_key = "exec_summary"
    elif normalized_key in ("presentation_deck", "pptx", "slides"):
        normalized_key = "presentation"
    elif normalized_key in ("video_package", "video_script"):
        normalized_key = "video"
    elif normalized_key in ("infographic_spec", "infographics"):
        normalized_key = "infographic"

    system_prompt = FORMAT_SYSTEM_PROMPTS.get(normalized_key, FORMAT_SYSTEM_PROMPTS["advisory"])

    evidence_block = format_source_chunks_context(chunks)
    params_block = format_parameters_context(parameters)

    user_prompt = f"""OPERATOR MISSION PARAMETERS: {params_block}

SOURCE EVIDENCE (cite chunk_ids exactly as shown):
{evidence_block}

Generate the deliverable. Extract real facts from the source — do NOT use placeholder text.
"""

    return {
        "system": system_prompt,
        "user": user_prompt,
        "format_key": normalized_key,
    }
