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
"""

FORMAT_SYSTEM_PROMPTS: Dict[str, str] = {
    "linkedin": f"""You are an elite national security communications officer creating an executive LinkedIn thought-leadership post.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Transform the source material into an authoritative, engaging, and professional post that stops the scroll, conveys key cyber-resilience lessons, and provides actionable takeaways with strategic hashtags.
""",

    "twitter": f"""You are a sovereign intelligence analyst creating an accurate, numbered Twitter/X thread.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Transform the source material into a sequence of tweets.
CONSTRAINT: Each tweet's `content` MUST strictly be 280 characters or fewer. Count your characters carefully. Include tweet numbering (e.g., 1/N, 2/N) and relevant hashtags.
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


def format_source_chunks_context(chunks: List[Dict[str, Any]], max_chunks: int = 20) -> str:
    """
    Formats source chunks into structured text for LLM prompting.
    When a document has many chunks (e.g. 118 chunks across 20 pages),
    samples uniformly across all pages to provide full end-to-end document research.
    """
    if not chunks:
        return "No source evidence chunks provided."

    selected_chunks = chunks
    if len(chunks) > max_chunks:
        step = len(chunks) / max_chunks
        indices = [int(i * step) for i in range(max_chunks)]
        selected_chunks = [chunks[i] for i in indices]

    formatted = []
    for chunk in selected_chunks:
        chunk_id = chunk.get("chunk_id", "unknown_chunk")
        source_name = chunk.get("source_name", "Unknown Source")
        page = chunk.get("page_number", "N/A")
        text = chunk.get("text", "").strip()
        role = chunk.get("source_role", "PRIMARY")
        formatted.append(f"[{chunk_id}] (Source: {source_name}, Page: {page}, Role: {role}):\n{text}")

    return "\n\n".join(formatted)


def format_parameters_context(parameters: Dict[str, Any]) -> str:
    """Formats operator-selected dashboard parameters into prompt instructions."""
    if not parameters:
        return "Default settings: Authoritative tone, Executive audience, High detail."

    lines = []
    if "tone" in parameters:
        lines.append(f"- Tone: {parameters['tone']}")
    if "target_audience" in parameters or "audience" in parameters:
        aud = parameters.get("target_audience") or parameters.get("audience")
        lines.append(f"- Target Audience: {aud}")
    if "detail_level" in parameters:
        lines.append(f"- Detail Level: {parameters['detail_level']}")
    if "communication_objective" in parameters or "objective" in parameters:
        obj = parameters.get("communication_objective") or parameters.get("objective")
        lines.append(f"- Communication Objective: {obj}")
    if "content_style" in parameters or "style" in parameters:
        st = parameters.get("content_style") or parameters.get("style")
        lines.append(f"- Content Style: {st}")

    return "\n".join(lines) if lines else "Default operational settings."


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
    summary_block = f"\nOVERALL CONTEXT SUMMARY:\n{context_summary}\n" if context_summary else ""

    user_prompt = f"""OPERATOR MISSION PARAMETERS:
{params_block}
{summary_block}
AUTHORITATIVE SOURCE EVIDENCE CHUNKS (Reference these chunks and cite their chunk_ids):
{evidence_block}

INSTRUCTION:
Generate the requested deliverable strictly matching the required schema. Ensure every claim references valid chunk_ids from the evidence above. Never invent facts or chunk IDs.
"""

    return {
        "system": system_prompt,
        "user": user_prompt,
        "format_key": normalized_key,
    }
