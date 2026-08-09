# วิธี Build Restaurant POS เป็น Desktop App

## สำหรับ Dev Mode (ยังต้องรัน terminal)
```powershell
# Terminal 1
cd apps\api && npm run start:dev

# Terminal 2  
cd apps\web && npm run dev

# Terminal 3
cd apps\desktop && npm run start
```

## สำหรับ Production (เปิดโปรแกรมได้เลย ไม่ต้องรัน terminal)

### ขั้นที่ 1 — Build API
```powershell
cd D:\restaurant-pos\apps\api
npm run build
```

### ขั้นที่ 2 — Build Web (standalone)
```powershell
cd D:\restaurant-pos\apps\web
npm run build
```

### ขั้นที่ 3 — Package Electron เป็น .exe
```powershell
cd D:\restaurant-pos\apps\desktop
npm run make
```

ไฟล์ .exe จะอยู่ที่:
`apps\desktop\out\make\squirrel.windows\x64\RestaurantPOS-1.0.0 Setup.exe`

### ติดตั้งและเปิดใช้งาน
- ดับเบิลคลิก Setup.exe
- เปิด Restaurant POS จาก Start Menu หรือ Desktop Shortcut
- ระบบจะรัน API + Web อัตโนมัติ ไม่ต้องรัน terminal ใดๆ
