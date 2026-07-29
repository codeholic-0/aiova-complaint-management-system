import io
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)


def extract_text_from_email(file_bytes: bytes) -> str:
    content = file_bytes.decode("utf-8", errors="ignore")
    lines = []
    in_body = False
    for line in content.split("\n"):
        if line.strip() == "":
            in_body = True
            continue
        if in_body and not line.startswith("--") and not line.startswith("Content-"):
            lines.append(line.strip())
    return "\n".join(lines)