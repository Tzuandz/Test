document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử
    const canvas = document.getElementById('idCardCanvas');
    const ctx = canvas.getContext('2d');

    const schoolInput = document.getElementById('school-input');
    const nameInput = document.getElementById('name-input');
    const dobInput = document.getElementById('dob-input');
    const addressInput = document.getElementById('address-input');
    const expiryInput = document.getElementById('expiry-input');
    const imageInput = document.getElementById('image-input');
    const downloadBtn = document.getElementById('download-btn');

    // Tải ảnh nền và ảnh đại diện mặc định
    const cardTemplate = new Image();
    cardTemplate.src = 'card_template.png';

    let profilePic = new Image();
    profilePic.src = 'default_avatar.jpg';

    // Hàm vẽ lại toàn bộ canvas
    function redrawCanvas() {
        // 1. Vẽ ảnh nền
        ctx.drawImage(cardTemplate, 0, 0, canvas.width, canvas.height);

        // 2. Vẽ ảnh đại diện
        ctx.drawImage(profilePic, 20, 70, 120, 120);

        // 3. Thiết lập kiểu chữ cho các label (Name, D.O.B,...)
        ctx.font = 'bold 14.5px Arial';
        ctx.fillStyle = '#3e3e3e';
        ctx.fillText('Name', 175, 87);
        ctx.fillText('D.O.B', 175, 112);
        ctx.fillText('Address', 175, 137);
        ctx.fillText('Religion', 175, 162);
        ctx.fillText('Valid Date', 175, 209);

        // 4. Thiết lập kiểu chữ cho thông tin người dùng
        ctx.font = 'normal 14.5px Arial';
        ctx.fillText(`: ${nameInput.value.toUpperCase()}`, 225, 87);
        ctx.fillText(`: ${dobInput.value}`, 225, 112);
        ctx.fillText(`: ${addressInput.value}`, 225, 137);
        ctx.fillText(': Islam', 225, 162); // Religion cố định
        ctx.fillText(expiryInput.value, 250, 209);

        // 5. Vẽ tên trường (font khác)
        ctx.font = '900 28px Roboto';
        ctx.fillStyle = '#003366';
        ctx.fillText(schoolInput.value.toUpperCase(), 20, 43);
    }

    // Đảm bảo ảnh nền được tải xong trước khi vẽ lần đầu
    cardTemplate.onload = () => {
        redrawCanvas();
    };
    profilePic.onload = () => {
        redrawCanvas();
    };

    // Lắng nghe sự kiện thay đổi input
    [schoolInput, nameInput, dobInput, addressInput, expiryInput].forEach(input => {
        input.addEventListener('input', redrawCanvas);
    });

    // Xử lý khi người dùng tải ảnh mới
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            profilePic.src = URL.createObjectURL(file);
        }
    });

    // Chức năng tải về
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        // toDataURL('image/png', 1.0) cho chất lượng cao nhất
        link.href = canvas.toDataURL('image/png', 1.0);
        link.download = 'the-sinh-vien-hoan-chinh.png';
        link.click();
    });
});
