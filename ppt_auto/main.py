import json
import pandas as pd
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN

# ✅ 엑셀 파일 경로
excel_path = "./data.xlsx"  # 데이터 파일 경로
output_pptx_path = "./test.pptx"  # 출력할 PPT 파일 경로

# ✅ 엑셀 데이터 읽기 (NaN 값은 빈 문자열로 변환)
df = pd.read_excel(excel_path).fillna("")

# ✅ PowerPoint 생성
prs = Presentation()

# ✅ 지원자_ID - 자소서_ID 기준으로 중복 제거하여 원본과 밑줄 인덱스를 한 번만 저장
unique_docs = {}

for _, row in df.iterrows():
    key = (row["지원자_ID"], row["자소서_ID"])  # 지원자 ID + 자소서 ID 조합

    if key not in unique_docs:
        unique_docs[key] = {
            "원본": str(row["원본"]),  # ✅ float로 변환되는 것 방지
            "밑줄 인덱스": json.loads(row["밑줄 인덱스"]) if isinstance(row["밑줄 인덱스"], str) else [],
            "질문 리스트": []
        }

    # ✅ 같은 문서에 해당하는 질문 추가
    unique_docs[key]["질문 리스트"].append(row["질문"])

# ✅ PowerPoint 슬라이드 생성
for (지원자_ID, 자소서_ID), content in unique_docs.items():
    slide = prs.slides.add_slide(prs.slide_layouts[5])  # 빈 슬라이드 레이아웃

    # ✅ 지원자 ID 텍스트 추가
    title_shape = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(3), Inches(0.5))
    title_text_frame = title_shape.text_frame
    title_text_frame.text = f"지원자 ID: {지원자_ID}"
    title_text_frame.paragraphs[0].font.bold = True
    title_text_frame.paragraphs[0].font.size = Pt(20)

    # ✅ 원본 텍스트 추가 (밑줄 적용)
    content_shape = slide.shapes.add_textbox(Inches(0.5), Inches(1), Inches(9), Inches(2))
    content_text_frame = content_shape.text_frame
    content_text_frame.word_wrap = True
    p = content_text_frame.add_paragraph()

    original_text = content["원본"]
    underline_ranges = content["밑줄 인덱스"]

    last_index = 0
    for underline_range in underline_ranges:
        start = underline_range["start"]
        end = underline_range["end"]

        # ✅ 밑줄이 없는 부분 추가
        if last_index < start:
            run = p.add_run()
            run.text = str(original_text[last_index:start])  # ✅ float 변환 방지

        # ✅ 밑줄이 있는 부분 추가
        run = p.add_run()
        run.text = str(original_text[start:end])  # ✅ float 변환 방지
        run.font.underline = True  # ✅ 밑줄 적용

        last_index = end

    # ✅ 마지막 남은 텍스트 추가
    if last_index < len(original_text):
        run = p.add_run()
        run.text = str(original_text[last_index:])  # ✅ float 변환 방지

    # ✅ 질문 리스트 추가
    questions_text = "\n".join([f"- {q}" for q in content["질문 리스트"]])
    question_shape = slide.shapes.add_textbox(Inches(0.5), Inches(3.5), Inches(9), Inches(3))
    question_text_frame = question_shape.text_frame
    question_text_frame.word_wrap = True
    question_text_frame.text = "질문 리스트:\n" + questions_text

# ✅ PowerPoint 저장
prs.save(output_pptx_path)

print(f"✅ PowerPoint 파일이 성공적으로 저장되었습니다: {output_pptx_path}")
