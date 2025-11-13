// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: [MUHSIN SM]
// KELAS: [WPH-REP-20]
// TANGGAL: [13 Nov 25]
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = path.resolve(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 30000; // 10 detik
const DAYS_IN_WEEK = 7;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()

const userProfile = {
  name: 'Muhsin SM',
  joinDate: new Date('2024-11-13'),
  totalHabits: 0,
  completedThisWeek: 0,
  updateStats(habits) {
    this.totalHabits = habits.length;
    this.completedThisWeek = habits.reduce((count, habit) => {
      return count + habit.getThisWeekCompletions();
    }, 0);
  },
  getDaysJoined() {
    const now = new Date();
    const diffTime = Math.abs(now - this.joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()

class Habit {
  constructor(name, targetFrequency) {
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = [];
  }

  markComplete() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.completions.includes(today)) {
      this.completions.push(today);
    }
  }

  getThisWeekCompletions() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - DAYS_IN_WEEK);
    return this.completions.filter((date) => new Date(date) >= oneWeekAgo)
      .length;
  }

  isCompletedThisWeek() {
    return this.getThisWeekCompletions() >= this.targetFrequency;
  }

  getProgressPercentage() {
    return (this.getThisWeekCompletions() / this.targetFrequency) * 100;
  }

  getStatus() {
    return this.isCompletedThisWeek() ? 'Completed' : 'In Progress';
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// - Constructor
// - Method addHabit(name, frequency)
// - Method completeHabit(habitIndex)
// - Method deleteHabit(habitIndex)
// - Method displayProfile()
// - Method displayHabits(filter)
// - Method displayHabitsWithWhile()
// - Method displayHabitsWithFor()
// - Method displayStats()
// - Method startReminder()
// - Method showReminder()
// - Method stopReminder()
// - Method saveToFile()
// - Method loadFromFile()
// - Method clearAllData()

class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminderIntervalId = null;
    // this.loadFromFile();
  }

  addHabit(name, frequency) {
    const habit = new Habit(name, frequency);
    this.habits.push(habit);
    this.saveToFile();
  }

  completeHabit(habitIndex) {
    if (this.habits[habitIndex]) {
      this.habits[habitIndex].markComplete();
      this.saveToFile();
    }
  }

  deleteHabit(habitIndex) {
    if (this.habits[habitIndex]) {
      this.habits.splice(habitIndex, 1);
      this.saveToFile();
    }
  }

  displayProfile() {
    userProfile.updateStats(this.habits);
    console.log(`Name: ${userProfile.name}`);
    console.log(`Days Joined: ${userProfile.getDaysJoined()}`);
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Completed This Week: ${userProfile.completedThisWeek}`);
  }

  displayHabits(filter) {
    let filteredHabits = this.habits;
    if (filter === 'completed') {
      filteredHabits = this.habits.filter((habit) =>
        habit.isCompletedThisWeek()
      );
    } else if (filter === 'in-progress') {
      filteredHabits = this.habits.filter(
        (habit) => !habit.isCompletedThisWeek()
      );
    }

    filteredHabits.forEach((habit, index) => {
      console.log(
        `${index + 1}. ${habit.name} - ${habit.getStatus()} - ${habit
          .getProgressPercentage()
          .toFixed(2)}%`
      );
    });

    if (filteredHabits.length === 0) {
      console.log('Tidak ada kebiasaan.');
    }

    // this.saveToFile();

    // showMenu();
  }

  displayHabitsWithWhile() {
    let i = 0;
    while (i < this.habits.length) {
      console.log(`${i + 1}. ${this.habits[i].name}`);
      i++;
    }
  }

  displayHabitsWithFor() {
    for (let i = 0; i < this.habits.length; i++) {
      console.log(`${i + 1}. ${this.habits[i].name}`);
    }
  }

  displayStats() {
    userProfile.updateStats(this.habits);
    console.log('=== Statistics ===');
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Completed This Week: ${userProfile.completedThisWeek}`);
  }

  startReminder() {
    if (this.reminderIntervalId) return;
    this.reminderIntervalId = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);
  }

  showReminder() {
    console.log(
      '\n🔔 Reminder: Jangan lupa untuk menyelesaikan kebiasaanmu hari ini!'
    );
  }

  stopReminder() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }

  saveToFile() {
    const data = this.habits.map((habit) => ({
      name: habit.name,
      targetFrequency: habit.targetFrequency,
      completions: habit.completions,
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }

  loadFromFile() {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE));
      this.habits = data.map((h) => {
        const habit = new Habit(h.name, h.targetFrequency);
        habit.completions = h.completions;
        return habit;
      });
    }
  }

  clearAllData() {
    this.habits = [];
    this.saveToFile();
    console.log('All habit data has been cleared.');
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  // TODO: Buat method askQuestion(question) dalam HabitTracker

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  // TODO: Buat function displayMenu()

  displayMenu() {
    console.log('\n=== Habit Tracker Menu ===');
    console.log('1. View Profile');
    console.log('2. View All Habits');
    console.log('3. View Completed Habits');
    console.log('4. View In-Progress Habits');
    console.log('5. Add New Habit');
    console.log('6. Mark Habit as Complete');
    console.log('7. Delete Habit');
    console.log('8. View Statistics');
    console.log('9. Clear All Data');
    console.log('0. Exit');
  }

  // TODO: Buat async method handleMenu()

  async handleMenu() {
    this.displayMenu();
    const choice = await this.askQuestion('Enter your choice: ');
    switch (choice) {
      case '1':
        this.displayProfile();
        break;
      case '2':
        this.displayHabits();
        break;
      case '3':
        this.displayHabits('completed');
        break;
      case '4':
        this.displayHabits('in-progress');
        break;
      case '5':
        const name = await this.askQuestion('Enter habit name: ');
        const frequency = await this.askQuestion('Enter target frequency: ');
        this.addHabit(name, Number(frequency));
        break;
      case '6':
        const habitIndex = await this.askQuestion('Enter habit index: ');
        this.completeHabit(Number(habitIndex) - 1);
        break;
      case '7':
        const deleteIndex = await this.askQuestion('Enter habit index: ');
        this.deleteHabit(Number(deleteIndex) - 1);
        break;
      case '8':
        this.displayStats();
        break;
      case '9':
        this.clearAllData();
        break;
      case '0':
        console.log('Goodbye!');
        rl.close();
        break;
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
  // ============================================
  // MAIN FUNCTION
  // ============================================
  // TODO: Buat async function main()

  async main() {
    this.startReminder();
    while (true) {
      await this.handleMenu();
      await this.handleMenu();
    }
  }

  // TODO: Jalankan main() dengan error handling
}
const tracker = new HabitTracker();

(async () => {
  await tracker.main();
})().catch((error) => {
  console.error('An error occurred:', error);
  rl.close();
});
