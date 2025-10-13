document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử từ HTML
    const schoolInput = document.getElementById('school-input');
    const nameInput = document.getElementById('name-input');
    const dobInput = document.getElementById('dob-input');
    const expiryInput = document.getElementById('expiry-input');
    const imageInput = document.getElementById('image-input');
    const downloadBtn = document.getElementById('download-btn');

    const schoolOutput = document.getElementById('school-output');
    const nameOutput = document.getElementById('name-output');
    const dobOutput = document.getElementById('dob-output');
    const expiryOutput = document.getElementById('expiry-output');
    const profilePic = document.getElementById('profile-pic');
    const idCard = document.querySelector('.id-card');

    // Hàm cập nhật thông tin
    const updateCard = (inputElement, outputElement, defaultValue) => {
        outputElement.textContent = inputElement.value.toUpperCase() || defaultValue;
    };

    // Lắng nghe sự kiện nhập liệu
    schoolInput.addEventListener('input', () => updateCard(schoolInput, schoolOutput, 'IUH'));
    nameInput.addEventListener('input', () => updateCard(nameInput, nameOutput, 'VAN KHANH DANG'));
    dobInput.addEventListener('input', () => updateCard(dobInput, dobOutput, '12/11/2025'));
    expiryInput.addEventListener('input', () => updateCard(expiryInput, expiryOutput, '11/11/2030'));

    // Xử lý thay đổi ảnh đại diện
    imageInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePic.src = e.target.result;
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    });

    // Chức năng tải thẻ về máy
    downloadBtn.addEventListener('click', () => {
        html2canvas(idCard, {
            scale: 3, // Tăng chất lượng ảnh đầu ra
            useCORS: true // Để xử lý ảnh từ nguồn khác nếu có
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'the-sinh-vien.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Oops, something went wrong!', err);
            alert('Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại.');
        });
    });
});
