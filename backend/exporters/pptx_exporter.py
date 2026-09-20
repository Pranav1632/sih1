import os
from typing import Union, Dict, Any
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

from backend.models.formats.presentation_schema import PresentationSchema, Slide


def export_pptx(deck: Union[PresentationSchema, Dict[str, Any]], output_path: str) -> str:
    """
    Exports a PresentationSchema (or compatible dict) to a valid PowerPoint (.pptx) file.
    Includes title slide, hierarchical bullet points, visual layout guidance,
    full presenter speaker notes, and citation footers.
    """
    if isinstance(deck, dict):
        deck_model = PresentationSchema(**deck)
    else:
        deck_model = deck

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Color Palette: Sovereign Intelligence Dark Theme
    bg_color = RGBColor(15, 23, 42)        # Slate 900
    card_color = RGBColor(30, 41, 59)      # Slate 800
    text_primary = RGBColor(248, 250, 252) # Slate 50
    text_muted = RGBColor(148, 163, 184)   # Slate 400
    accent_blue = RGBColor(56, 189, 248)   # Sky 400
    accent_gold = RGBColor(251, 191, 36)   # Amber 400

    def add_background(slide):
        bg_shape = slide.shapes.add_shape(
            1,  # MSO_SHAPE.RECTANGLE
            0, 0, prs.slide_width, prs.slide_height
        )
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = bg_color
        bg_shape.line.color.rgb = bg_color
        return bg_shape

    # 1. Title Slide
    title_slide = prs.slides.add_slide(blank_layout)
    add_background(title_slide)

    # Decorative header bar
    top_bar = title_slide.shapes.add_shape(1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = accent_blue
    top_bar.line.fill.background()

    # Title Box
    title_box = title_slide.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(11.733), Inches(4.5))
    tf = title_box.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "SENTINEL-TRANSFORM // SOVEREIGN INTELLIGENCE PLATFORM"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = accent_blue
    p0.space_after = Pt(24)

    p1 = tf.add_paragraph()
    p1.text = deck_model.deck_title
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = text_primary
    p1.space_after = Pt(20)

    p2 = tf.add_paragraph()
    p2.text = f"Target Audience: {deck_model.target_audience}"
    p2.font.size = Pt(18)
    p2.font.color.rgb = accent_gold
    p2.space_after = Pt(12)

    p3 = tf.add_paragraph()
    p3.text = "Zero Cloud Egress  |  Forensic Evidence Attribution  |  Deterministic Hard Gate"
    p3.font.size = Pt(13)
    p3.font.color.rgb = text_muted

    # Title Slide Speaker Notes
    title_notes = title_slide.notes_slide.notes_text_frame
    title_notes.text = f"Presentation: {deck_model.deck_title}\nAudience: {deck_model.target_audience}\nGenerated via Sentinel-Transform air-gapped deterministic pipeline."

    # 2. Content Slides
    for slide_data in deck_model.slides:
        slide = prs.slides.add_slide(blank_layout)
        add_background(slide)

        # Slide Number Badge & Header
        badge_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.0))
        btf = badge_box.text_frame
        btf.word_wrap = True

        bp0 = btf.paragraphs[0]
        bp0.text = f"SLIDE {slide_data.slide_number:02d} // BRIEFING DECK"
        bp0.font.size = Pt(11)
        bp0.font.bold = True
        bp0.font.color.rgb = accent_blue

        bp1 = btf.add_paragraph()
        bp1.text = slide_data.title
        bp1.font.size = Pt(28)
        bp1.font.bold = True
        bp1.font.color.rgb = text_primary

        # Slide Content Container (Left: Bullets, Right: Visual Guidance)
        has_guidance = bool(slide_data.visual_guidance and slide_data.visual_guidance.strip())
        content_width = Inches(7.5) if has_guidance else Inches(11.733)

        content_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), content_width, Inches(4.5))
        ctf = content_box.text_frame
        ctf.word_wrap = True

        for i, pt_text in enumerate(slide_data.bullet_points):
            p = ctf.paragraphs[0] if i == 0 else ctf.add_paragraph()
            p.text = f"•  {pt_text}"
            p.font.size = Pt(16)
            p.font.color.rgb = text_primary
            p.space_after = Pt(14)

        # Visual Guidance Card (Right Column)
        if has_guidance:
            guide_shape = slide.shapes.add_shape(
                1,  # MSO_SHAPE.RECTANGLE
                Inches(8.6), Inches(1.8), Inches(3.933), Inches(4.5)
            )
            guide_shape.fill.solid()
            guide_shape.fill.fore_color.rgb = card_color
            guide_shape.line.color.rgb = accent_blue
            guide_shape.line.width = Pt(1)

            gtf = guide_shape.text_frame
            gtf.word_wrap = True
            gp0 = gtf.paragraphs[0]
            gp0.text = "VISUAL LAYOUT DIRECTION"
            gp0.font.size = Pt(12)
            gp0.font.bold = True
            gp0.font.color.rgb = accent_gold
            gp0.space_after = Pt(10)

            gp1 = gtf.add_paragraph()
            gp1.text = slide_data.visual_guidance
            gp1.font.size = Pt(14)
            gp1.font.color.rgb = text_muted

        # Citations Footer (Bottom)
        if slide_data.slide_reference_citations:
            footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.6), Inches(11.733), Inches(0.5))
            ftf = footer_box.text_frame
            fp = ftf.paragraphs[0]
            citations_str = ", ".join(slide_data.slide_reference_citations)
            fp.text = f"[Evidence Reference Citations: {citations_str}]"
            fp.font.size = Pt(10)
            fp.font.color.rgb = text_muted

        # Slide Speaker Notes
        notes_frame = slide.notes_slide.notes_text_frame
        notes_content = [
            f"=== SPEAKER SCRIPT (Slide {slide_data.slide_number}: {slide_data.title}) ===",
            slide_data.speaker_notes or "No speaker notes provided.",
            "",
            f"Visual Guidance: {slide_data.visual_guidance or 'Standard presentation layout'}",
            f"Citations: {', '.join(slide_data.slide_reference_citations) if slide_data.slide_reference_citations else 'None'}"
        ]
        notes_frame.text = "\n".join(notes_content)

    prs.save(output_path)
    return output_path
