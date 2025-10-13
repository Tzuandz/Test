document.addEventListener('DOMContentLoaded', () => {
    // Các trường nhập liệu
    const schoolInput = document.getElementById('school-input');
    const nameInput = document.getElementById('name-input');
    const dobInput = document.getElementById('dob-input');
    const expiryInput = document.getElementById('expiry-input');
    const imageInput = document.getElementById('image-input');
    const downloadBtn = document.getElementById('download-btn');

    // Các trường hiển thị trên thẻ
    const schoolOutput = document.getElementById('school-output');
    const nameOutput = document.getElementById('name-output');
    const dobOutput = document.getElementById('dob-output');
    const expiryOutput = document.getElementById('expiry-output');
    const profilePic = document.getElementById('profile-pic');
    const idCard = document.querySelector('.id-card');

    // Hàm cập nhật thông tin lên thẻ
    const updateCard = () => {
        schoolOutput.textContent = schoolInput.value.toUpperCase();
        // Tự động thêm dấu hai chấm ":"
        nameOutput.textContent = `: ${nameInput.value.toUpperCase()}`;
        dobOutput.textContent = `: ${dobInput.value}`;
        expiryOutput.textContent = expiryInput.value;
    };

    // Lắng nghe sự kiện người dùng nhập liệu
    schoolInput.addEventListener('input', updateCard);
    nameInput.addEventListener('input', updateCard);
    dobInput.addEventListener('input', updateCard);
    expiryInput.addEventListener('input', updateCard);

    // Xử lý thay đổi ảnh đại diện
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            profilePic.src = URL.createObjectURL(file);
        }
    });

    // Chức năng tải thẻ
    downloadBtn.addEventListener('click', () => {
        const cardWrapper = document.querySelector('.id-card-wrapper');
        cardWrapper.style.transform = 'rotate(0deg)'; // Chụp ảnh thẳng

        html2canvas(idCard, { scale: 4, backgroundColor: null }).then(canvas => {
            cardWrapper.style.transform = 'rotate(5deg)'; // Trả về hiệu ứng cũ
            const link = document.createElement('a');
            link.download = 'the-sinh-vien.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // Cập nhật thẻ lần đầu với giá trị trống
    updateCard();
});
