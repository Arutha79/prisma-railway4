import schedule
import time
import subprocess

def job():
    subprocess.run(["python", "prisma_bridge/coach_productif.py"])
    subprocess.run(["python", "prisma_bridge/souffle_autonome.py"])

if __name__ == "__main__":
    schedule.every().day.at("08:00").do(job)
    print("[CRON] Lancement des souffles automatisés à 08:00 chaque jour")
    while True:
        schedule.run_pending()
        time.sleep(60)
