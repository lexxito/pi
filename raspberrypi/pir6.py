#!/usr/bin/python3

import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import random
import time
import sys
import os
list_of_names = ["Oleksii", "Serhii", "Sean", "Mojito", "Diego", "Roddy", "Piyush",
                 "Panos", "Andy", "Giovanni"]
broker = "160.85.252.45"
topic = "lexxito"
client_name = "client_to_publish"
PIR_PIN = 7
number_of_iterations = 60
iterations = number_of_iterations

f = open('output.txt','w')
sys.stdout = f

def print_and_flush(text):
    print(text)
    sys.stdout.flush()

def set_up_gpio_and_mqqtt():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIR_PIN, GPIO.IN)
    print_and_flush("GPOI is set")
    try:
        local_client = mqtt.Client(client_name)
        local_client.connect(broker)
        print_and_flush("mqtt client is set")
        return GPIO, local_client
    except:
        os.system('sh /var/www/cron/check_wifi.sh')
        time.sleep(10)
        print_and_flush("Restart the script")
        os.execv('/home/pi/code/pir6.py', [''])

try:
    print_and_flush("PIR Module Test (CTRL+C to exit)")
    time.sleep(2)
    GPIO, client = set_up_gpio_and_mqqtt()
    print_and_flush("Ready")
    while True:
        if iterations <= 0:
            GPIO, client = set_up_gpio_and_mqqtt()
            iterations = number_of_iterations
        if GPIO.input(PIR_PIN):
            print_and_flush("trying to send data")
            local_time = time.asctime(time.localtime(time.time()))
            print_and_flush({"time": local_time, "status": "move"})
            try:
                client.publish(topic, str({"time": local_time, "status": random.choice(list_of_names)}))
                print_and_flush("the record was send successfully")
            except:
                print_and_flush("problem with sending record: " + local_time)
        time.sleep(2)
        iterations -=1

except KeyboardInterrupt:
    GPIO.cleanup()

