// AUTO LOGIN CHECK ON REFRESH
(function autoLogin() {
    const session = sessionStorage.getItem('active_user');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data && data.user) {
                const role = data.user.role;
                if (role === 'santri') window.location.href = 'santri.html';
                else if (role === 'pengurus') window.location.href = 'pengurus.html';
                else if (role === 'admin') window.location.href = 'admin.html';
            }
        } catch(err) {
            sessionStorage.removeItem('active_user');
        }
    }
})();

// ROLE SELECTION TAB HANDLER
let currentRole = 'santri';
document.querySelectorAll('.role-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.role-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRole = btn.dataset.role;
    });
});

// LOGIN SUBMIT CONTROLLER
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('ep-username').value;
    const password = document.getElementById('ep-password').value;
    
    showToast("Mengotentikasi...");
    
    let res = await callApi('login', { email, password });
    if (res.status === 'success') {
        const user = res.data.user;
        let details = res.data.details || {};
        
        // Save session
        sessionStorage.setItem('active_user', JSON.stringify({
            user: user,
            santriInfo: details.santriInfo || null,
            pengurusInfo: details.pengurusInfo || null
        }));
        
        showToast("Masuk berhasil!");
        
        setTimeout(() => {
            if (user.role === 'santri') window.location.href = 'santri.html';
            else if (user.role === 'pengurus') window.location.href = 'pengurus.html';
            else if (user.role === 'admin') window.location.href = 'admin.html';
        }, 800);
    } else {
        showToast(res.message, true);
    }
});