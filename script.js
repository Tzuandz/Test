document.addEventListener('DOMContentLoaded', () => {
    // Các trường nhập liệu
    const schoolInput = document.getElementById('school-input');
    const nameInput = document.getElementById('name-input');
    const dobInput = document.getElementById('dob-input');
    const addressInput = document.getElementById('address-input'); // Thêm address
    const expiryInput = document.getElementById('expiry-input');
    const imageInput = document.getElementById('image-input');

    // Các trường hiển thị trên thẻ
    const schoolOutput = document.getElementById('school-output');
    const nameOutput = document.getElementById('name-output');
    const dobOutput = document.getElementById('dob-output');
    const addressOutput = document.getElementById('address-output'); // Thêm address
    const religionOutput = document.getElementById('religion-output'); // Thêm religion
    const expiryOutput = document.getElementById('expiry-output');
    const profilePic = document.getElementById('profile-pic');
    const idCard = document.getElementById('id-card');
    const downloadBtn = document.getElementById('download-btn');

    // Thiết lập giá trị mặc định cho Religion
    religionOutput.textContent = ': Islam';

    // Hàm cập nhật thông tin
    const updateCard = () => {
        schoolOutput.textContent = schoolInput.value.toUpperCase();
        nameOutput.textContent = `: ${nameInput.value.toUpperCase()}`;
        dobOutput.textContent = `: ${dobInput.value}`;
        addressOutput.textContent = `: ${addressInput.value}`; // Cập nhật address
        expiryOutput.textContent = expiryInput.value;
    };

    // Lắng nghe sự kiện
    schoolInput.addEventListener('input', updateCard);
    nameInput.addEventListener('input', updateCard);
    dobInput.addEventListener('input', updateCard);
    addressInput.addEventListener('input', updateCard); // Lắng nghe address
    expiryInput.addEventListener('input', updateCard);

    // Xử lý ảnh
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            profilePic.src = URL.createObjectURL(file);
        }
    });

    // Chức năng tải thẻ
    downloadBtn.addEventListener('click', () => {
        // html2canvas sẽ chụp lại nội dung hiển thị trên thẻ
        html2canvas(idCard, { scale: 4, useCORS: true, backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'the-sinh-vien-chuan.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // Cập nhật thẻ lần đầu khi tải trang
    updateCard();
});
