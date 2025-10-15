# =============================
# 1️⃣ Sử dụng image Node chính thức
# =============================
FROM node:18

# =============================
# 2️⃣ Tạo thư mục làm việc trong container
# =============================
WORKDIR /usr/src/app

# =============================
# 3️⃣ Copy file khai báo dependencies trước để cache layer
# =============================
COPY package*.json ./

# =============================
# 4️⃣ Cài đặt tất cả dependencies (bao gồm dev dependencies)
#    Dùng --legacy-peer-deps để tránh xung đột peer deps
#    Và rebuild để các module native (như @unrs, sharp, v.v.) được build sẵn
# =============================
RUN npm install --legacy-peer-deps \
    && npm rebuild \
    && npm cache clean --force

# =============================
# 5️⃣ Copy toàn bộ source code vào container
# =============================
COPY . .

# =============================
# 6️⃣ Expose port ứng dụng
# =============================
EXPOSE 3000

# =============================
# 7️⃣ Lệnh chạy khi container khởi động
# =============================
CMD ["node", "src/app.js"]
