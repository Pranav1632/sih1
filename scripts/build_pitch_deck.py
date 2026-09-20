"""
scripts/build_pitch_deck.py - Compiles the 6-Slide SIH Technical Pitch Deck.
Per PPTX_BUILD.md exact specifications for NTRO Problem Statement 26154.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Sentinel_Transform_Pitch_Deck.pptx"))

# Color Palette: Sovereign Intelligence Dark Theme
BG_COLOR = RGBColor(15, 23, 42)         # Slate 900
CARD_BG = RGBColor(30, 41, 59)          # Slate 800
TEXT_WHITE = RGBColor(248, 250, 252)    # Slate 50
TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400
ACCENT_BLUE = RGBColor(56, 189, 248)    # Sky 400
ACCENT_TEAL = RGBColor(45, 212, 191)    # Teal 400
ACCENT_RED = RGBColor(248, 113, 113)    # Red 400
ACCENT_GREEN = RGBColor(74, 222, 128)   # Green 400
ACCENT_PURPLE = RGBColor(167, 139, 250) # Purple 400
BORDER_COLOR = RGBColor(51, 65, 85)     # Slate 700


def add_slide_background(prs, slide):
    """Fills slide background with dark slate navy."""
    bg = slide.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.color.rgb = BG_COLOR
    return bg


def add_header_badge(slide, title_text, badge_color):
    """Adds standard geometric header badge and slide title."""
    # Top accent pill
    pill = slide.shapes.add_shape(1, Inches(0.8), Inches(0.5), Inches(0.15), Inches(0.55))
    pill.fill.solid()
    pill.fill.fore_color.rgb = badge_color
    pill.line.fill.background()

    # Title text box
    tb = slide.shapes.add_textbox(Inches(1.1), Inches(0.45), Inches(11.0), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title_text.upper()
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE


def build_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: Title Page
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s1)

    # Sovereign Badge
    badge_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.5), Inches(0.5))
    p = badge_box.text_frame.paragraphs[0]
    p.text = "SMART INDIA HACKATHON 2026 | PROBLEM STATEMENT 26154 | NTRO"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    # Title & Subtitle
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.5), Inches(2.2))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "SENTINEL-TRANSFORM"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p2 = tf.add_paragraph()
    p2.text = "Sovereign Multi-Format Intelligence Transformation Engine"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_TEAL
    p2.space_before = Pt(8)

    # Metadata Grid Cards
    card1 = s1.shapes.add_shape(1, Inches(0.8), Inches(4.0), Inches(5.6), Inches(2.6))
    card1.fill.solid()
    card1.fill.fore_color.rgb = CARD_BG
    card1.line.color.rgb = BORDER_COLOR
    tf1 = card1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = Inches(0.3)
    p = tf1.paragraphs[0]
    p.text = "OPERATIONAL FOCUS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    bullets = [
        "Theme: Blockchain & Cybersecurity | Software Category",
        "National Technical Research Organisation (NTRO)",
        "Air-Gapped Sovereign Deployment: 0 KB Egress by Architecture",
        "1 Source Document -> 7 Production Deliverables Simultaneously"
    ]
    for b in bullets:
        bp = tf1.add_paragraph()
        bp.text = f"•  {b}"
        bp.font.size = Pt(12)
        bp.font.color.rgb = TEXT_WHITE
        bp.space_before = Pt(6)

    card2 = s1.shapes.add_shape(1, Inches(6.8), Inches(4.0), Inches(5.7), Inches(2.6))
    card2.fill.solid()
    card2.fill.fore_color.rgb = CARD_BG
    card2.line.color.rgb = BORDER_COLOR
    tf2 = card2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = Inches(0.3)
    p = tf2.paragraphs[0]
    p.text = "FLAGSHIP INNOVATIONS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL
    diffs = [
        "Entity Fact-Check Hard Gate: Flags transpositions in <10ms CPU",
        "Deterministic Compilation: Pydantic schemas -> real .pptx & .docx",
        "Sentence-Level Provenance: Click-to-highlight chunk coordinates",
        "Primary/Supporting Governance: Auto-resolves conflicting numbers"
    ]
    for d in diffs:
        dp = tf2.add_paragraph()
        dp.text = f"•  {d}"
        dp.font.size = Pt(12)
        dp.font.color.rgb = TEXT_WHITE
        dp.space_before = Pt(6)

    # =========================================================================
    # SLIDE 2: Innovation & Uniqueness
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s2)
    add_header_badge(s2, "Innovation & Uniqueness: Beyond Black-Box AI", ACCENT_BLUE)

    # Stat Callout Badge top right
    stat_box = s2.shapes.add_shape(1, Inches(10.5), Inches(0.4), Inches(2.0), Inches(0.7))
    stat_box.fill.solid()
    stat_box.fill.fore_color.rgb = RGBColor(12, 74, 110)
    stat_box.line.color.rgb = ACCENT_BLUE
    stf = stat_box.text_frame
    p = stf.paragraphs[0]
    p.text = "0 KB EGRESS"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    # Solution & Problem boxes
    sol_box = s2.shapes.add_shape(1, Inches(0.8), Inches(1.4), Inches(5.6), Inches(2.2))
    sol_box.fill.solid()
    sol_box.fill.fore_color.rgb = CARD_BG
    sol_box.line.color.rgb = BORDER_COLOR
    tf = sol_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "THE PROPOSED SOLUTION"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    bullets = [
        "Transforms 1 analyst-supplied report into 7 mission deliverables.",
        "Anchored to single immutable shared context (zero cross-format contradiction).",
        "Deterministic compilation: LLM writes structured schema, code compiles native files."
    ]
    for b in bullets:
        bp = tf.add_paragraph()
        bp.text = f"•  {b}"
        bp.font.size = Pt(11)
        bp.font.color.rgb = TEXT_WHITE
        bp.space_before = Pt(4)

    prob_box = s2.shapes.add_shape(1, Inches(6.8), Inches(1.4), Inches(5.7), Inches(2.2))
    prob_box.fill.solid()
    prob_box.fill.fore_color.rgb = CARD_BG
    prob_box.line.color.rgb = BORDER_COLOR
    tf = prob_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "HOW IT ADDRESSES THE NTRO BOTTLENECK"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL
    bullets = [
        "Reclaims ~70% analyst bandwidth spent rewriting across audience formats.",
        "Air-gapped by design: Classified intelligence never touches cloud APIs.",
        "Forensic sentence provenance: Every fact cites specific source chunk and page."
    ]
    for b in bullets:
        bp = tf.add_paragraph()
        bp.text = f"•  {b}"
        bp.font.size = Pt(11)
        bp.font.color.rgb = TEXT_WHITE
        bp.space_before = Pt(4)

    # 5 Differentiator Tiles Row
    diff_titles = [
        ("1. Zero-Egress Air-Gap", "Local Ollama runtime, no API keys, zero cloud telemetry."),
        ("2. Hard Gate (<10ms)", "spaCy+RapidFuzz catches transpositions & locks download."),
        ("3. Source Governance", "1.0 / 0.5 authority weights resolve cross-doc number clashes."),
        ("4. Deterministic Code", "Pydantic v2 schemas compile into authentic .pptx and .docx."),
        ("5. Sentence Provenance", "Clickable [Ref: P.2] drawer scrolls & highlights source text.")
    ]
    tile_width = Inches(2.28)
    for i, (title, desc) in enumerate(diff_titles):
        x = Inches(0.8) + i * Inches(2.42)
        tile = s2.shapes.add_shape(1, x, Inches(3.9), tile_width, Inches(3.0))
        tile.fill.solid()
        tile.fill.fore_color.rgb = CARD_BG
        tile.line.color.rgb = ACCENT_BLUE if i == 1 else BORDER_COLOR
        ttf = tile.text_frame
        ttf.word_wrap = True
        ttf.margin_left = ttf.margin_top = Inches(0.15)
        p = ttf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE if i == 1 else ACCENT_TEAL
        p2 = ttf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 3: Tech Stack & Architecture
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s3)
    add_header_badge(s3, "Enterprise Technology Stack: 100% On-Premise", ACCENT_TEAL)

    # Pipeline columns
    col_data = [
        ("INGESTION & SEI", [
            ("PyMuPDF", "PDF page & char-level indexing"),
            ("python-docx", "Document & table parsing"),
            ("Tesseract OCR", "Scanned tactical images"),
            ("faster-whisper", "Local audio/video ASR (int8)"),
            ("SQLite SEI", "Source Evidence Index database")
        ]),
        ("ORCHESTRATION", [
            ("LangGraph", "Deterministic StateGraph"),
            ("MemorySaver", "Checkpoint state persistence"),
            ("Bounded Reflection", "Self-audit loop (cap <= 1)"),
            ("Interrupt Before", "Pause before export node"),
            ("FastAPI", "Async endpoints + HTTP 423 lock")
        ]),
        ("INFERENCE & VERIFICATION", [
            ("Ollama Local", "qwen2.5:3b (CPU) / 7b (GPU)"),
            ("spaCy NER", "en_core_web_sm (<10ms)"),
            ("RapidFuzz", "Token transposition matching"),
            ("Hard Gate", "Physical export locking"),
            ("NetworkX", "GraphRAG traversal (Phase 2)")
        ]),
        ("EXPORT & INTERFACE", [
            ("python-pptx", "Native slides + speaker notes"),
            ("python-docx", "Formal institutional advisories"),
            ("React + Vite", "TypeScript dark-mode UI"),
            ("Tailwind CSS", "Tactical military aesthetic"),
            ("Citation Drawer", "Hover-to-highlight source")
        ]),
    ]

    col_width = Inches(2.78)
    for i, (col_title, items) in enumerate(col_data):
        x = Inches(0.8) + i * Inches(2.95)
        box = s3.shapes.add_shape(1, x, Inches(1.4), col_width, Inches(4.6))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = BORDER_COLOR
        btf = box.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = Inches(0.2)
        p = btf.paragraphs[0]
        p.text = col_title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = ACCENT_TEAL
        for name, note in items:
            p1 = btf.add_paragraph()
            p1.text = f"• {name}"
            p1.font.size = Pt(11)
            p1.font.bold = True
            p1.font.color.rgb = TEXT_WHITE
            p1.space_before = Pt(6)
            p2 = btf.add_paragraph()
            p2.text = f"   {note}"
            p2.font.size = Pt(9)
            p2.font.color.rgb = TEXT_MUTED

    # Bottom Hardware Execution Strip
    strip = s3.shapes.add_shape(1, Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.8))
    strip.fill.solid()
    strip.fill.fore_color.rgb = RGBColor(19, 78, 74)
    strip.line.color.rgb = ACCENT_TEAL
    stf = strip.text_frame
    p = stf.paragraphs[0]
    p.text = "HARDWARE EXECUTION POLICY: Dev on Windows 11 CPU (qwen2.5:3b) | Demo on RTX 3050 (qwen2.5:7b) | 0 KB Outbound Network Egress"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 4: Risk -> Mitigation & Feasibility
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s4)
    add_header_badge(s4, "Risk Mitigation & Scientific Feasibility", ACCENT_RED)

    # 4 Risk-Mitigation Cards
    risks = [
        ("RISK: Local LLM Latency During Demo",
         "MITIGATION: Fast-Forward Video & Model Tiering",
         "Scripted video uses 4x-8x fast-forward with on-screen timer during model passes; universal fallback phi4-mini / 3B ensures instant turnaround."),
        ("RISK: Entity Gate False-Flags Synonyms",
         "MITIGATION: Tuned 75%-99% Similarity Band + Override",
         "Strict ratio matching targets transposed word order; analyst retains one-click 'Override with Signed Authorization' so platform never blocks silently."),
        ("RISK: Conflicting Facts Across Documents",
         "MITIGATION: Deterministic Source Governance (1.0 vs 0.5)",
         "Primary doc given 1.0 weight; supporting doc given 0.5 weight. Numerical discrepancies automatically flagged in merged context."),
        ("RISK: Judges Skeptical of 'Zero Hallucination'",
         "MITIGATION: Deliberate Live Transposition Demonstration",
         "Demo deliberately triggers 'Directorate of Grid Power Resilience' vs source 'Directorate of Power Grid Resilience' showing Hard Gate halting export.")
    ]

    for i, (rtitle, mtitle, desc) in enumerate(risks):
        x = Inches(0.8) + (i % 2) * Inches(5.95)
        y = Inches(1.4) + (i // 2) * Inches(2.2)
        rcard = s4.shapes.add_shape(1, x, y, Inches(5.75), Inches(2.0))
        rcard.fill.solid()
        rcard.fill.fore_color.rgb = CARD_BG
        rcard.line.color.rgb = BORDER_COLOR
        rtf = rcard.text_frame
        rtf.word_wrap = True
        rtf.margin_left = rtf.margin_top = Inches(0.2)
        p = rtf.paragraphs[0]
        p.text = rtitle
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_RED
        p2 = rtf.add_paragraph()
        p2.text = mtitle
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_GREEN
        p2.space_before = Pt(2)
        p3 = rtf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_WHITE
        p3.space_before = Pt(4)

    # Feasibility Strip
    fstrip = s4.shapes.add_shape(1, Inches(0.8), Inches(5.9), Inches(11.7), Inches(1.1))
    fstrip.fill.solid()
    fstrip.fill.fore_color.rgb = CARD_BG
    fstrip.line.color.rgb = ACCENT_BLUE
    ftf = fstrip.text_frame
    ftf.word_wrap = True
    ftf.margin_left = ftf.margin_top = Inches(0.2)
    p = ftf.paragraphs[0]
    p.text = "WHY IT IS FEASIBLE & DEFENSE-GRADE:"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = ftf.add_paragraph()
    p2.text = "Every component runs locally on CPU with zero internet connection. Built on published peer-reviewed methods: Dhuliawala et al. (ACL 2024, CoVe) and Tang et al. (EMNLP 2024, MiniCheck). 47/47 test cases passing with sub-10ms entity matching."
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_WHITE
    p2.space_before = Pt(3)

    # =========================================================================
    # SLIDE 5: Benefits by Domain
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s5)
    add_header_badge(s5, "Mission Impact & Operational Scale", ACCENT_GREEN)

    # Domain Impact Table Rows
    domains = [
        ("OPERATIONAL SPEED",
         "Reclaims up to 70% of analytical hours currently lost to repetitive manual drafting across 7 audience deliverables.",
         "Analysts spend hours per incident manually redrafting briefs."),
        ("NATIONAL SECURITY",
         "Sub-second advisory compilation and distribution without sacrificing technical fidelity or operational security.",
         "CERT-In alone issued 65 formal advisories, 1,530 alerts & 390 vulnerability notes in 2025."),
        ("INCIDENT SCALE",
         "Processes surge-volume intelligence without requiring proportional headcount growth across agency bureaus.",
         "CERT-In handled 29.44 Lakh (2.94M) cyber incidents in 2025, rising ~30% in 2026."),
        ("TRUST & AUDITABILITY",
         "Forensic sentence-level citations + Hard Gate eliminate black-box generative drift and ensure legal admissibility.",
         "Unchecked cloud LLMs hallucinate false IPs, organizations, and CVE numbers."),
        ("DATA SOVEREIGNTY",
         "Guarantees 0 KB outbound network egress. Classified source material never reaches foreign or cloud servers.",
         "Defense regulations strictly prohibit third-party cloud AI processing.")
    ]

    for i, (dom, benefit, scale) in enumerate(domains):
        y = Inches(1.4) + i * Inches(1.05)
        row_box = s5.shapes.add_shape(1, Inches(0.8), y, Inches(11.7), Inches(0.95))
        row_box.fill.solid()
        row_box.fill.fore_color.rgb = CARD_BG
        row_box.line.color.rgb = BORDER_COLOR
        rtf = row_box.text_frame
        rtf.word_wrap = True
        rtf.margin_left = Inches(0.25)
        rtf.margin_top = Inches(0.12)
        p = rtf.paragraphs[0]
        p.text = f"{dom}: "
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN
        p.add_run().text = benefit
        p.runs[1].font.size = Pt(10)
        p.runs[1].font.color.rgb = TEXT_WHITE
        p2 = rtf.add_paragraph()
        p2.text = f"Problem Scale: {scale}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = ACCENT_TEAL
        p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 6: Key Papers & India Defense Context
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_background(prs, s6)
    add_header_badge(s6, "Academic Grounding & India Defense Context", ACCENT_PURPLE)

    pcard1 = s6.shapes.add_shape(1, Inches(0.8), Inches(1.4), Inches(5.7), Inches(4.5))
    pcard1.fill.solid()
    pcard1.fill.fore_color.rgb = CARD_BG
    pcard1.line.color.rgb = BORDER_COLOR
    tf1 = pcard1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = Inches(0.25)
    p = tf1.paragraphs[0]
    p.text = "RESEARCH CITATIONS & THEORETICAL BASIS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE

    papers = [
        ("Dhuliawala et al. (ACL 2024)", "Chain-of-Verification Reduces Hallucination in Large Language Models (Basis for Verification Gate)"),
        ("Tang, Laban & Durrett (EMNLP 2024)", "MiniCheck: Efficient Fact-Checking of LLMs on Grounding Documents (Basis for Source Attribution)"),
        ("Ji et al. (2023, arXiv:2310.06271)", "Towards Mitigating Hallucination in LLMs via Self-Reflection (Basis for Bounded Reflection)"),
        ("Jacovi et al. (2025, arXiv:2501.03200)", "The FACTS Grounding Leaderboard: Benchmarking Long-Form Input Grounding"),
        ("Edge et al. (Microsoft 2024)", "From Local to Global: GraphRAG Query-Focused Summarization (Phase 2 Roadmap)")
    ]
    for auth, desc in papers:
        bp = tf1.add_paragraph()
        bp.text = f"• {auth}: "
        bp.font.size = Pt(10)
        bp.font.bold = True
        bp.font.color.rgb = TEXT_WHITE
        bp.space_before = Pt(6)
        bp.add_run().text = desc
        bp.runs[1].font.size = Pt(9)
        bp.runs[1].font.color.rgb = TEXT_MUTED

    pcard2 = s6.shapes.add_shape(1, Inches(6.8), Inches(1.4), Inches(5.7), Inches(4.5))
    pcard2.fill.solid()
    pcard2.fill.fore_color.rgb = CARD_BG
    pcard2.line.color.rgb = BORDER_COLOR
    tf2 = pcard2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = Inches(0.25)
    p = tf2.paragraphs[0]
    p.text = "INDIA CYBERSECURITY CONTEXT (NTRO & CERT-In)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL

    contexts = [
        ("NCIIPC under NTRO", "Mandated to protect Critical Information Infrastructure (Power, Defense, Telecom) with near-real-time advisories."),
        ("CERT-In National Agency", "Handles 2.94M annual cyber incidents, requiring multi-audience communication across government and public."),
        ("The Dissemination Gap", "No sovereign, air-gapped platform currently exists in India to automate verified multi-format dissemination."),
        ("Sovereign Compliance", "Aligns directly with National Cyber Security Policy mandates requiring 100% on-premise containment.")
    ]
    for title, desc in contexts:
        bp = tf2.add_paragraph()
        bp.text = f"• {title}: "
        bp.font.size = Pt(10)
        bp.font.bold = True
        bp.font.color.rgb = TEXT_WHITE
        bp.space_before = Pt(8)
        bp.add_run().text = desc
        bp.runs[1].font.size = Pt(9)
        bp.runs[1].font.color.rgb = TEXT_MUTED

    # Bottom summary tag
    sum_strip = s6.shapes.add_shape(1, Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.9))
    sum_strip.fill.solid()
    sum_strip.fill.fore_color.rgb = RGBColor(24, 24, 27)
    sum_strip.line.color.rgb = ACCENT_PURPLE
    stf = sum_strip.text_frame
    p = stf.paragraphs[0]
    p.text = "SENTINEL-TRANSFORM: Production-Ready Sovereign Multi-Format Transformation for NTRO PS 26154"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE

    # Save presentation
    prs.save(OUTPUT_PATH)
    print(f"[+] Successfully generated pitch deck at: {OUTPUT_PATH}")
    return OUTPUT_PATH


if __name__ == "__main__":
    build_deck()
