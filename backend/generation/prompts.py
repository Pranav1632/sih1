"""
backend/generation/prompts.py - Format-Specific Prompts for Sentinel-Transform.
Owned by: LLM/Prompt Engineer (Role #3).
Per BUILD_03_llm_prompt_engineer.md Task 2.
"""

from typing import Dict, Any, List


BASE_GROUNDING_INSTRUCTIONS = """
CARDINAL PRINCIPLES:
1. THE SOURCE IS THE ABSOLUTE FACTUAL AUTHORITY: Output deliverables may adapt style and tone, but may NEVER invent facts, statistics, IOCs, CVEs, or organizational entities not grounded in the source text.
2. CITATION REQUIREMENT: You MUST include the exact source `chunk_id` in `cited_chunk_ids` for every deliverable (e.g. ["doc_01_chunk_01"]).
3. AIR-GAPPED DEFENSE COMPLIANCE: Do not suggest external cloud APIs, cloud scanners, or third-party SaaS services.
4. MANDATORY QUANTITATIVE & METRIC DENSITY: Always extract and highlight concrete empirical metrics, benchmark results (e.g., F1 scores, accuracy percentages, latency), sample sizes (e.g., "3M addresses"), date ranges, algorithms, and technical properties directly from the evidence. Never use vague generalizations when exact numbers exist.
5. ADAPTIVE DOMAIN ALIGNMENT:
   - For ACADEMIC/TECHNICAL PAPERS: Focus on methodology, novel contributions, baseline comparisons, mathematical/computational techniques, and operational implications. Do NOT invent fictional attack incidents.
   - For CYBER THREAT/INCIDENT REPORTS: Focus on vectors, affected systems, forensic IOCs, CVEs, and compliance directives.
"""

FORMAT_SYSTEM_PROMPTS: Dict[str, str] = {
    "linkedin": f"""You are an elite communications officer and research analyst creating an executive LinkedIn thought-leadership post.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Transform the source material into an authoritative, deeply informed post that stops the scroll, conveys key technical and strategic breakthroughs, cites exact empirical findings, and provides actionable takeaways with strategic hashtags.
""",

    "twitter": f"""You are an expert technical intelligence communicator writing for X (formerly Twitter).
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Write a SINGLE, authoritative, highly detailed tweet summarizing the core breakthrough and metrics of the document.
STRICT CONSTRAINTS:
1. EXACTLY ONE TWEET: The entire `content` MUST strictly be between 200 and 275 characters (never exceed 280 characters).
2. HARD METRICS: You MUST include at least 2 concrete numbers from the source (e.g., accuracy %, F1 score, sample size, or time duration).
3. Do NOT write a thread (no '1/5', '2/5'). Output exactly 1 comprehensive tweet in the `tweets` array.
""",

    "advisory": f"""You are a senior technical assessment lead at a sovereign agency (NTRO/CERT-In).
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Draft an authoritative Technical Assessment / Intelligence Advisory.
REQUIREMENTS:
- Determine an appropriate `advisory_id` (e.g., NTRO-ADV-2026-XX or NTRO-TA-2026-XX).
- Set `severity_level` (CRITICAL, HIGH, MEDIUM, or LOW).
- If source is an incident, detail attack mechanisms and forensic IOCs. If source is research/whitepaper, detail technical mechanisms, systemic risks, and observable behavior patterns.
- Enumerate actionable mitigations and governance compliance directives.
""",

    "exec_summary": f"""You are an intelligence advisor to senior executive and research leadership.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Produce an executive situational briefing summarizing the core findings, empirical results, and strategic value.
REQUIREMENTS:
- Synthesize a clear 1-paragraph `situation_overview` highlighting the author/organization and problem scope.
- Enumerate 3 to 5 `core_findings` packed with concrete technical and empirical metrics from the text.
- Assess strategic impact (financial, operational, technological, or defense).
- Enumerate immediate `decisions_required` by leadership.
- Set confidence assessment (HIGH | MODERATE | LOW).
""",

    "presentation": f"""You are an executive briefer creating an operational 16:9 slide presentation.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Produce an editable multi-slide briefing deck with comprehensive speaker notes and visual layout guidance.
REQUIREMENTS:
- Provide 3-5 hierarchical bullet points per slide containing specific technical details and metrics.
- Include actionable visual layout guidance (e.g., "2-column split with performance comparison bar chart").
- Provide a complete spoken script in `speaker_notes` for each slide.
""",

    "video": f"""You are a professional multimedia intelligence producer scripting a detailed video briefing package.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Create a comprehensive scene-by-scene storyboard, narration script, lower-third subtitles, and audio sound cues strictly grounded in the source document.
REQUIREMENTS:
- Provide at least 3 detailed scenes matching the mission parameters (tone, audience, and detail level).
- For each scene, specify:
  * `scene_number`: Integer (1, 2, 3...)
  * `duration_seconds`: Appropriate scene length (e.g., 15s, 30s, 15s)
  * `visual_description`: Detailed visual camera directions, motion graphics, charts, and b-roll concepts grounded in the document topic.
  * `narration_voiceover`: Full, professional spoken script explaining the document's core findings and metrics (NOT placeholder text).
  * `on_screen_subtitles`: Punchy lower-third display banners.
  * `music_sound_cues`: Audio pacing and tone direction.
- Provide a clear `logline` and `target_duration` (e.g., "60 Seconds").
""",

    "infographic": f"""You are an intelligence visualization specialist creating an Infographic Content Spec.
{BASE_GROUNDING_INSTRUCTIONS}
OBJECTIVE: Break down the intelligence into modular visual sections with key stats, descriptive copy, and recommended chart types.
REQUIREMENTS:
- Recommend standard chart types: Bar Chart | Flowchart | Timeline | Metric Card.
- Extract high-impact numbers, metrics, or timeline stages as key callouts.
""",
}


def format_source_chunks_context(chunks: List[Dict[str, Any]], max_chunks: int = 10) -> str:
    """
    Intelligent section-aware chunk sampling for multi-page documents (1 to 300+ pages).
    Guarantees coverage across critical document zones:
    1. Title, Abstract & Executive Synopsis (first 3 chunks)
    2. Architecture & Methodology (~20% mark)
    3. Core Empirical Results & Benchmark Tables (~50%, ~65%, ~75% marks)
    4. Conclusion, Strategic Recommendations & Discussion (~90%, ~95% marks)
    """
    if not chunks:
        return "No source evidence chunks provided."

    if len(chunks) <= max_chunks:
        selected_chunks = chunks
    else:
        n = len(chunks)
        # Strategic anchor distribution
        anchors = [
            0, 1, 2,                                # Abstract & Intro
            max(3, int(n * 0.18)),                  # Methodology / Setup
            int(n * 0.45), int(n * 0.60), int(n * 0.72),  # Results & Evaluation Tables
            int(n * 0.86), int(n * 0.94), max(0, n - 1)  # Conclusion & Summary
        ]
        # De-duplicate while preserving sequence
        seen_indices = set()
        unique_indices = []
        for idx in anchors:
            if 0 <= idx < n and idx not in seen_indices:
                seen_indices.add(idx)
                unique_indices.append(idx)
        unique_indices.sort()
        selected_chunks = [chunks[i] for i in unique_indices[:max_chunks]]

    formatted = []
    for chunk in selected_chunks:
        chunk_id = chunk.get("chunk_id", "unknown_chunk")
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
