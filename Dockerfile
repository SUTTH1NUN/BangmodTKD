FROM python:3.10-slim

# ตั้งค่า Working Directory ใน Container
WORKDIR /app

# คัดลอกไฟล์ requirements.txt และติดตั้ง dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดทั้งหมดลงใน Container
COPY . .

# เปิด Port 5000 (ตามที่ Flask ใช้งาน)
EXPOSE 5000

# รันแอปพลิเคชัน
CMD ["python", "-m", "backend.app"]
