const readline = require('readline');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, 'habits-data.json');
const REMINDER_INTERVAL = 10000;
const DAYS_IN_WEEK = 7;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const userProfile = {
  name: 'Muhsin SM',
  joinDate: new Date('2024-11-13'),
  totalHabits: 0,
  completedThisWeek: 0,
  updateStats(habits) {
    this.totalHabits = habits.length;
    this.completedThisWeek = habits.reduce(
      (count, habit) => count + habit.getThisWeekCompletions(),
      0
    );
  },
  getDaysJoined() {
    const now = new Date();
    const diffTime = Math.abs(now - this.joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

class Habit {
  constructor(name, targetFrequency) {
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = [];
  }
  markComplete() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.completions.includes(today)) this.completions.push(today);
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

class HabitTracker {
  constructor() {
    this.habits = [];
    this.reminderIntervalId = null;
    this.loadFromFile();
  }

  askQuestion(question) {
    return new Promise((resolve) => rl.question(question, resolve));
  }

  addHabit(name, frequency) {
    const habit = new Habit(name, frequency);
    this.habits.push(habit);
    this.saveToFile();
  }

  completeHabit(index) {
    if (this.habits[index]) {
      this.habits[index].markComplete();
      this.saveToFile();
    }
  }

  deleteHabit(index) {
    if (this.habits[index]) {
      this.habits.splice(index, 1);
      this.saveToFile();
    }
  }

  displayProfile() {
    userProfile.updateStats(this.habits);
    console.log(`\n=== User Profile ===`);
    console.log(`👤 Name: ${userProfile.name}`);
    console.log(`📅 Days Joined: ${userProfile.getDaysJoined()}`);
    console.log(`📊 Total Habits: ${userProfile.totalHabits}`);
    console.log(`🏅 Completed This Week: ${userProfile.completedThisWeek}`);
  }

  displayHabits(filter) {
    let filtered = this.habits;
    if (filter === 'completed')
      filtered = this.habits.filter((h) => h.isCompletedThisWeek());
    if (filter === 'in-progress')
      filtered = this.habits.filter((h) => !h.isCompletedThisWeek());

    if (filtered.length === 0) console.log('Tidak ada kebiasaan.');
    filtered.forEach((h, i) =>
      console.log(
        `${i + 1}. ${h.name} - ${h.getStatus()} (${h
          .getProgressPercentage()
          .toFixed(1)}%)`
      )
    );
  }

  displayStats() {
    userProfile.updateStats(this.habits);
    console.log('\n=== Statistik ===');
    console.log(`Total Habits: ${userProfile.totalHabits}`);
    console.log(`Completed This Week: ${userProfile.completedThisWeek}`);
  }

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
        const freq = await this.askQuestion('Enter target frequency: ');
        this.addHabit(name, Number(freq));
        break;
      case '6':
        const index = await this.askQuestion('Enter habit index: ');
        this.completeHabit(Number(index) - 1);
        break;
      case '7':
        const delIndex = await this.askQuestion('Enter habit index: ');
        this.deleteHabit(Number(delIndex) - 1);
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
        process.exit(0);
      default:
        console.log('Invalid choice.');
    }
  }

  async main() {
    this.startReminder();
    while (true) {
      await this.handleMenu();
    }
  }

  startReminder() {
    if (!this.reminderIntervalId) {
      this.reminderIntervalId = setInterval(
        () => console.log('\n⏰ Jangan lupa cek kebiasaanmu!'),
        REMINDER_INTERVAL
      );
    }
  }

  saveToFile() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.habits, null, 2));
  }

  loadFromFile() {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE));
      this.habits = data.map((h) =>
        Object.assign(new Habit(h.name, h.targetFrequency), h)
      );
    }
  }

  clearAllData() {
    this.habits = [];
    this.saveToFile();
    console.log('🧹 Semua data kebiasaan telah dihapus.');
  }
}

const tracker = new HabitTracker();

(async () => {
  await tracker.main();
})().catch((error) => {
  console.error('An error occurred:', error);
  rl.close();
});
