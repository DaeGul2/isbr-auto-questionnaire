import win32com.client
import time
from pptx import Presentation
from pptx.util import Inches

# ✅ 엑셀 & PPT 초기화
excel = win32com.client.DispatchEx("Excel.Application")  # ✅ DispatchEx 사용
ppt = win32com.client.Dispatch("PowerPoint.Application")

# ✅ 엑셀 파일 열기
excel_path = "./data.xlsx"
wb = excel.Workbooks.Open(excel_path)
ws = wb.Sheets(1)  # 첫 번째 시트 선택

# ✅ PowerPoint 새 프레젠테이션 열기
prs = ppt.Presentations.Add()
ppt.Visible = True  # PPT 창 표시

time.sleep(1)  # ✅ PPT가 완전히 로드될 때까지 대기

# ✅ 데이터 구조
row = 2  # 엑셀 데이터 시작 행 (1은 헤더)
while True:
    지원자_ID = ws.Cells(row, 1).Value  # A열 (지원자 ID)
    자소서_ID = ws.Cells(row, 2).Value  # B열 (자소서 ID)
    질문 = ws.Cells(row, 3).Value  # C열 (질문)
    원본 = ws.Cells(row, 6).Value  # F열 (원본)

    if not 지원자_ID:  # 데이터 없으면 종료
        break

    # ✅ 새 슬라이드 추가
    slide = prs.Slides.Add(1, 5)  # 5 = 빈 슬라이드 레이아웃
    
    # ✅ 지원자 ID 추가 (좌측 상단)
    textbox = slide.Shapes.AddTextbox(1, Inches(0.5), Inches(0.2), Inches(2), Inches(0.5))
    textbox.TextFrame.TextRange.Text = f"지원자 ID: {지원자_ID}"

    # ✅ 엑셀에서 "원본" 셀 복사 (서식 유지됨)
    ws.Cells(row, 6).Copy()  # F열 (원본)
    time.sleep(1)  # ✅ 딜레이 추가 (복사 대기)

    # ✅ PowerPoint에서 붙여넣기 (ActiveWindow → ActivePresentation 사용)
    prs.Slides(1).Shapes.Paste()
    time.sleep(1)  # ✅ 딜레이 추가

    # ✅ 질문 목록 추가 (아래쪽)
    textbox = slide.Shapes.AddTextbox(1, Inches(0.5), Inches(3.5), Inches(8), Inches(2.5))
    textbox.TextFrame.TextRange.Text = f"질문: {질문}"

    row += 1  # 다음 행으로 이동

# ✅ PPT 저장
output_pptx_path = "./test.pptx"
prs.SaveAs(output_pptx_path)
print(f"✅ PowerPoint 저장 완료: {output_pptx_path}")

# ✅ 엑셀 닫기
wb.Close(SaveChanges=False)
excel.Quit()

# ✅ PowerPoint 닫기
ppt.Quit()
