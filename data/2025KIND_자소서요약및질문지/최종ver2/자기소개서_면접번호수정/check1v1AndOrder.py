import pandas as pd
from pathlib import Path

base_dir = Path('.')

mapping = {
    '경력직.xlsx': 'pdf결과/1_경력직',
    '계약직,청년인턴.xlsx': 'pdf결과/2_계약직,청년인턴',
    '신입직(일반,보훈).xlsx': 'pdf결과/3_신입직(일반,보훈)'
}

def validate_order(excel_path, folder_path):
    df = pd.read_excel(excel_path)
    excel_nums = df['면접번호'].astype(str).str.strip().tolist()

    folder_files = sorted([f.stem.strip() for f in Path(folder_path).glob('*') if f.is_file()])

    # 길이부터 체크
    length_match = len(excel_nums) == len(folder_files)
    order_match = excel_nums == folder_files

    mismatches = []
    min_len = min(len(excel_nums), len(folder_files))
    for i in range(min_len):
        if excel_nums[i] != folder_files[i]:
            mismatches.append((i+1, excel_nums[i], folder_files[i]))

    return length_match, order_match, mismatches, excel_nums[min_len:], folder_files[min_len:]

# 결과 출력
for excel_file, folder in mapping.items():
    length_match, order_match, mismatches, extra_excel, extra_folder = validate_order(base_dir / excel_file, base_dir / folder)

    print(f"\n[{excel_file} ↔ {folder}]")

    if length_match and order_match:
        print("✅ 수험번호와 순서 모두 완벽히 일치합니다.")
    else:
        print("❌ 불일치 발견:")
        if not length_match:
            print(f" - 개수 불일치: 엑셀({len(extra_excel)}) vs 폴더({len(extra_folder)})")

        if mismatches:
            print(" - 순서 불일치 항목:")
            for idx, excel_num, folder_num in mismatches:
                print(f"    [{idx}] 엑셀: {excel_num} ↔ 폴더: {folder_num}")

        if extra_excel:
            print(f" - 엑셀에만 추가로 존재하는 수험번호: {extra_excel}")
        if extra_folder:
            print(f" - 폴더에만 추가로 존재하는 파일명: {extra_folder}")
