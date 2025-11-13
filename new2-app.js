// habit-tracker.js
const fs = require('fs');
const readline = require('readline');

// Membaca dan menulis file JSON
function loadJSON(path, defaultValue) {
  try {
    const data = fs.readFileSync(path, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// === Membuat Objek Profil Pengguna ===
const user = {
  name: 'Pengguna',
  joinedAt: new Date().toISOString(),
  totalCompleted: 0,

  // Method untuk memperbarui statistik
  updateStats(habits) {
    // Gunakan filter() untuk menghitung kebiasaan selesai
    const doneToday = habits.filter((h) => h.done).length;
    this.totalCompleted += doneToday;
    return doneToday;
  },

  // Method untuk menghitung berapa hari sudah bergabung
  getDaysJoined() {
    const joined = new Date(this.joinedAt);
    const now = new Date();
    const diffMs = now - joined;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days;
  },
};

// === Data kebiasaan ===
let habits = loadJSON('data.json', []);

// === CLI Setup ===
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// === MENU ===
function showMenu() {
  console.log('\n=== Pelacak Kebiasaan CLI ===');
  console.log('1. Tambah kebiasaan');
  console.log('2. Tandai selesai');
  console.log('3. Tampilkan progres');
  console.log('4. Profil pengguna');
  console.log('5. Keluar');
  rl.question('\nPilih menu (1-5): ', handleMenu);
}

function handleMenu(choice) {
  switch (choice) {
    case '1':
      addHabit();
      break;
    case '2':
      markHabit();
      break;
    case '3':
      showProgress();
      break;
    case '4':
      showProfile();
      break;
    case '5':
      rl.close();
      break;
    default:
      showMenu();
  }
}

// === Fungsi Tambahan ===
function addHabit() {
  rl.question('\nMasukkan nama kebiasaan baru: ', (name) => {
    if (name.trim() === '') {
      console.log('Nama tidak boleh kosong.');
    } else {
      habits.push({ name, done: false });
      saveJSON('data.json', habits);
      console.log(`✅ "${name}" ditambahkan.`);
    }
    showMenu();
  });
}

function markHabit() {
  if (habits.length === 0) {
    console.log('Belum ada kebiasaan.');
    return showMenu();
  }

  console.log('\nDaftar Kebiasaan:');
  habits.forEach((h, i) => console.log(`${i + 1}. ${h.name}`));

  rl.question('Masukkan nomor: ', (num) => {
    const index = parseInt(num) - 1;
    if (habits[index]) {
      habits[index].done = true;
      saveJSON('data.json', habits);
      console.log(`✅ "${habits[index].name}" ditandai selesai.`);
    } else {
      console.log('Nomor tidak valid.');
    }
    showMenu();
  });
}

function showProgress() {
  const done = habits.filter((h) => h.done).length;
  const total = habits.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const bar = '█'.repeat(percent / 5) + '░'.repeat(20 - percent / 5);
  console.log(`\nProgres: [${bar}] ${percent}% (${done}/${total})`);
  showMenu();
}

function showProfile() {
  const doneToday = habits.filter((h) => h.done).length;
  const totalDone = user.totalCompleted + doneToday;

  console.log('\n=== PROFIL PENGGUNA ===');
  console.log(`👤 Nama: ${user.name}`);
  console.log(`📅 Bergabung: ${new Date(user.joinedAt).toDateString()}`);
  console.log(`📈 Hari Aktif: ${user.getDaysJoined()} hari`);
  console.log(`🏅 Total kebiasaan diselesaikan: ${totalDone}`);
  showMenu();
}

// Jalankan program
showMenu();
