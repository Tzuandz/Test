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
        // Cập nhật và đảm bảo có giá trị mặc định nếu input rỗng
        schoolOutput.textContent = schoolInput.value.toUpperCase() || 'IUH';
        nameOutput.textContent = `: ${nameInput.value.toUpperCase()}` || ': VAN KHANH DANG';
        dobOutput.textContent = `: ${dobInput.value}` || ': 12/11/2025';
        expiryOutput.textContent = expiryInput.value || '11/11/2030';
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
        }).catch(err => {
            console.error('Lỗi khi tạo ảnh thẻ:', err);
            alert('Đã xảy ra lỗi, vui lòng thử lại.');
        });
    });

    // Gọi lần đầu để hiển thị giá trị mặc định khi trang tải
    updateCard();
});
