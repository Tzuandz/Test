document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('idCardCanvas');
    const ctx = canvas.getContext('2d');

    // --- CÀI ĐẶT ĐỘ PHÂN GIẢI CAO ---
    const SCALE_FACTOR = 3; // Phóng to gấp 3 lần
    const CARD_WIDTH = 500;
    const CARD_HEIGHT = 300;

    canvas.width = CARD_WIDTH * SCALE_FACTOR;
    canvas.height = CARD_HEIGHT * SCALE_FACTOR;
    // --- KẾT THÚC CÀI ĐẶT ---

    // Lấy các phần tử input
    const inputs = {
        school: document.getElementById('school-input'),
        name: document.getElementById('name-input'),
        dob: document.getElementById('dob-input'),
        address: document.getElementById('address-input'),
        expiry: document.getElementById('expiry-input'),
        image: document.getElementById('image-input'),
    };
    const downloadBtn = document.getElementById('download-btn');

    // Chuẩn bị ảnh
    const cardTemplate = new Image();
    cardTemplate.src = 'card_template.png';
    let profilePic = new Image();
    profilePic.src = 'default_avatar.jpg';

    // Hàm vẽ lại toàn bộ canvas
    function redrawCanvas() {
        // Xóa canvas cũ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Vẽ ảnh nền
        ctx.drawImage(cardTemplate, 0, 0, canvas.width, canvas.height);

        // 2. Vẽ ảnh đại diện
        ctx.drawImage(profilePic, 20 * SCALE_FACTOR, 70 * SCALE_FACTOR, 120 * SCALE_FACTOR, 120 * SCALE_FACTOR);

        // 3. Vẽ các label (Name, D.O.B,...)
        ctx.font = `bold ${14.5 * SCALE_FACTOR}px Arial`;
        ctx.fillStyle = '#3e3e3e';
        ctx.fillText('Name', 175 * SCALE_FACTOR, 87 * SCALE_FACTOR);
        ctx.fillText('D.O.B', 175 * SCALE_FACTOR, 112 * SCALE_FACTOR);
        ctx.fillText('Address', 175 * SCALE_FACTOR, 137 * SCALE_FACTOR);
        ctx.fillText('Religion', 175 * SCALE_FACTOR, 162 * SCALE_FACTOR);
        ctx.fillText('Valid Date', 175 * SCALE_FACTOR, 209 * SCALE_FACTOR);

        // 4. Vẽ thông tin người dùng nhập
        ctx.font = `normal ${14.5 * SCALE_FACTOR}px Arial`;
        ctx.fillText(`: ${inputs.name.value.toUpperCase()}`, 225 * SCALE_FACTOR, 87 * SCALE_FACTOR);
        ctx.fillText(`: ${inputs.dob.value}`, 225 * SCALE_FACTOR, 112 * SCALE_FACTOR);
        ctx.fillText(`: ${inputs.address.value}`, 225 * SCALE_FACTOR, 137 * SCALE_FACTOR);
        ctx.fillText(': Islam', 225 * SCALE_FACTOR, 162 * SCALE_FACTOR);
        
        ctx.font = `500 ${14.5 * SCALE_FACTOR}px Arial`; // Font đậm hơn cho ngày
        ctx.fillText(inputs.expiry.value, 250 * SCALE_FACTOR, 209 * SCALE_FACTOR);
        
        // 5. Vẽ tên trường
        ctx.font = `900 ${28 * SCALE_FACTOR}px Arial`;
        ctx.fillStyle = '#003366';
        ctx.fillText(inputs.school.value.toUpperCase(), 20 * SCALE_FACTOR, 43 * SCALE_FACTOR);
    }

    // Chỉ bắt đầu vẽ khi tất cả ảnh đã được tải xong
    Promise.all([
        new Promise(resolve => cardTemplate.onload = resolve),
        new Promise(resolve => profilePic.onload = resolve)
    ]).then(() => {
        redrawCanvas();
    });

    // Lắng nghe sự kiện
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', redrawCanvas);
    });

    // Xử lý tải ảnh mới
    inputs.image.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            profilePic.src = URL.createObjectURL(file);
            profilePic.onload = redrawCanvas; // Vẽ lại sau khi ảnh mới được tải
        }
    });

    // Tải về
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0);
        link.download = 'the-sinh-vien-final.png';
        link.click();
    });
});
