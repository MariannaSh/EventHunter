export default {
    props: ['targetDate'], 
    data() {
      return {
        timeLeft: {},
        intervalId: null
      };
    },
    mounted() {
      this.updateCountdown();
      this.intervalId = setInterval(this.updateCountdown, 1000);
    },
    beforeUnmount() {
      clearInterval(this.intervalId);
    },
    methods: {
      updateCountdown() {
        const now = new Date().getTime();
        let dateStr = this.targetDate;
        if (!dateStr.includes('T')) {
          dateStr += 'T23:59:59';
         }

        const target = new Date(this.targetDate).getTime();
        const difference = target - now;
  
        if (difference <= 0) {
          this.timeLeft = null;
          clearInterval(this.intervalId);
          return;
        }
  
        const seconds = Math.floor((difference / 1000) % 60);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  
        this.timeLeft = { days, hours, minutes, seconds };
      }
    },
    template: `
      <div v-if="timeLeft">
        <p>
          Pozostało:
          <strong>{{ timeLeft.days }}d</strong>
          <strong>{{ timeLeft.hours }}h</strong>
          <strong>{{ timeLeft.minutes }}m</strong>
          <strong>{{ timeLeft.seconds }}s</strong>
        </p>
      </div>
      <div v-else>
        <p>⏰ Wydarzenie już się rozpoczęło!</p>
      </div>
    `
  }
  