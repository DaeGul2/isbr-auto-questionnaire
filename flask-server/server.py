import os
import json
import pandas as pd
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS  # ✅ CORS 라이브러리 추가
from werkzeug.utils import secure_filename
from pptx import Presentation
from pptx.util import Inches, Pt, Cm
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# ✅ Flask 서버 초기화
app = Flask(__name__)
CORS(app)

# ✅ 업로드 및 출력 디렉토리 설정
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER

# ✅ PPT 생성 함수 (질문 포함)
def create_ppt(excel_path, output_pptx_path, id_to_text):
    df = pd.read_excel(excel_path)
    print(df)
    prs = Presentation()
    # A4 크기 세로 설정 (210mm x 297mm)
    prs.slide_width = Cm(21.0)
    prs.slide_height = Cm(29.7)
    print("컬럼 확인 : ", df.columns)

    whole_width = 7.5  # 전체 너비를 이 변수로 제어
    

    for _, row in df.iterrows():
        slide = prs.slides.add_slide(prs.slide_layouts[5])  # 백지 슬라이드

        # ✅ 지원자 ID 삽입 (좌측 상단)
        # 텍스트 박스 설정
        text_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(3), Inches(0.5))
        text_frame = text_box.text_frame
        text_frame.clear()

        # 단락 생성
        p = text_frame.add_paragraph()
        p.alignment = PP_ALIGN.LEFT

        # '수험번호:' 부분 추가 (볼드 처리)
        run = p.add_run()
        run.text = "수험번호 : "
        run.font.bold = True
        run.font.size = Pt(10)
        run.font.name = "맑은 고딕"

        # 수험번호 값 추가 (볼드 미처리)
        run = p.add_run()
        run.text = f"{row['지원자_ID']}\n"
        run.font.bold = False
        run.font.size = Pt(10)
        run.font.name = "맑은 고딕"

        # '지원분야:' 부분 추가 (볼드 처리)
        run = p.add_run()
        run.text = "지원분야 : "
        run.font.bold = True
        run.font.size = Pt(10)
        run.font.name = "맑은 고딕"

        # 지원분야 값 추가 (볼드 미처리)
        run = p.add_run()
        run.text = f"{dict(row).get('지원분야', '기본값')}"
        run.font.bold = False
        run.font.size = Pt(10)
        run.font.name = "맑은 고딕"

         # 자기소개서 제목
        title_y = 1.0
        text_box = slide.shapes.add_textbox(Inches(0.5), Inches(title_y+0.2), Inches(whole_width), Inches(0.5))
        text_frame = text_box.text_frame
        text_frame.clear()

        p = text_frame.add_paragraph()
        p.text = "자기소개서"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = RGBColor(0, 0, 0)
        p.font.name = "맑은 고딕"
        p.alignment = PP_ALIGN.LEFT
    
        # 자소서_ID에 맞는 설명
        description_y = title_y + 0.5
        description_text = id_to_text.get(str(row["자소서_ID"]), "기본값")

        text_box = slide.shapes.add_textbox(Inches(0.5), Inches(description_y+0.2), Inches(whole_width), Inches(0.5))
        text_frame = text_box.text_frame
        text_frame.clear()
        text_frame.word_wrap = True

        p = text_frame.add_paragraph()
        p.text = "질문 : " + description_text
        p.font.size = Pt(10)
        p.font.bold = False
        p.font.color.rgb = RGBColor(0, 0, 0)
        p.font.name = "맑은 고딕"
        p.alignment = PP_ALIGN.LEFT

        # Horizon (수평선)
        line_y = title_y + 0.65
        line_shape = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(line_y+0.2), Inches(whole_width), Inches(0.02)
        )
        line_shape.fill.solid()
        line_shape.fill.fore_color.rgb = RGBColor(200, 200, 200)
        line_shape.line.fill.background()

        # 원본 텍스트 및 밑줄 인덱스 처리
        original_text = str(row["원본"]).strip() if pd.notna(row["원본"]) else ""
        underline_ranges = json.loads(row["밑줄 인덱스"]) if pd.notna(row["밑줄 인덱스"]) else []

        text_box = slide.shapes.add_textbox(Inches(0.5), Inches(line_y - 0.1+0.2), Inches(whole_width), Inches(2))
        text_frame = text_box.text_frame
        text_frame.clear()
        text_frame.word_wrap = True

        p = text_frame.add_paragraph()
        p.line_spacing = 1.5
        p.space_after = Pt(10)
        p.space_before = Pt(10)

        last_index = 0
        for underline in underline_ranges:
            start, end = underline["start"], underline["end"]
            if last_index < start:
                run = p.add_run()
                run.text = original_text[last_index:start]

            run = p.add_run()
            run.text = original_text[start:end + 1]
            run.font.underline = True
            run.font.bold = True

            last_index = end + 1

        if last_index < len(original_text):
            run = p.add_run()
            run.text = original_text[last_index:]

        for run in p.runs:
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0, 0, 0)
            run.font.name = "맑은 고딕"

        # 질문 목록
        questions = str(row["질문"]).strip() if pd.notna(row["질문"]) else "질문 없음"
        question_y_position = line_y + 0.7 + (len(original_text) / 80 * 0.4)

        text_box = slide.shapes.add_textbox(Inches(0.5), Inches(question_y_position+3), Inches(whole_width), Inches(0.5))
        text_frame = text_box.text_frame
        text_frame.clear()

        p = text_frame.add_paragraph()
        p.text = "자기소개서 기반 면접 질문 제안"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = RGBColor(0, 0, 0)
        p.font.name = "맑은 고딕"
        p.alignment = PP_ALIGN.LEFT

        line_shape = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(question_y_position + 0.65+3), Inches(whole_width), Inches(0.02)
        )
        line_shape.fill.solid()
        line_shape.fill.fore_color.rgb = RGBColor(200, 200, 200)
        line_shape.line.fill.background()

        question_box = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(question_y_position + 1+3), Inches(whole_width), Inches(1.5)
        )
        question_box.fill.solid()
        question_box.fill.fore_color.rgb = RGBColor(245, 245, 245)
        question_box.line.color.rgb = RGBColor(180, 180, 180)
        question_box.shadow.inherit = True

        p = question_box.text_frame.add_paragraph()
        p.line_spacing = 1.5
        p.text = questions
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = RGBColor(0, 0, 0)
        p.font.name = "맑은 고딕"
        p.space_after = Pt(10)
        p.space_before = Pt(10)

    prs.save(output_pptx_path)

# ✅ API 엔드포인트 - 파일 업로드 및 질문 목록 전달
@app.route("/generate_ppt", methods=["POST"])
def generate_ppt():
    if "file" not in request.files or "id_to_text" not in request.form:
        return jsonify({"error": "파일 또는 질문 정보가 없습니다."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "파일명이 없습니다."}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    id_to_text = json.loads(request.form["id_to_text"])  # ✅ 질문 데이터 파싱

    # ✅ PPT 생성
    output_pptx_path = os.path.join(app.config["OUTPUT_FOLDER"], "output.pptx")
    create_ppt(file_path, output_pptx_path, id_to_text)

    return jsonify({"ppt_url": "http://localhost:5000/download_ppt"}), 200


# ✅ PPT 파일 다운로드 엔드포인트 추가
@app.route("/download_ppt", methods=["GET"])
def download_ppt():
    ppt_path = os.path.join(app.config["OUTPUT_FOLDER"], "output.pptx")

    if not os.path.exists(ppt_path):
        return jsonify({"error": "PPT 파일을 찾을 수 없습니다."}), 404

    return send_file(ppt_path, as_attachment=True, download_name="output.pptx")


# ✅ 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    print("🔥 Flask 서버가 5000번 포트에서 실행 중!")
