import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
PIR_PIN = 7
GPIO.setup(PIR_PIN, GPIO.IN)

broker= "mqtt.demonstrator.info"

print "GPIO is set up"
client= mqtt.Client("client_to_publish")
print "client is set up"
client.connect(broker)
print "client is connected"
try:
	print "PIR Module Test (CTRL+C to exit)"
	time.sleep(2)
	print "Ready"
	while True:
		if GPIO.input(PIR_PIN):
			local_time = time.asctime( time.localtime(time.time()) )
			try:
				client.publish("lexxito", str({"time": local_time, "status":"move"}))
			except:
				print "problem with sending record: " + local_time
			time.sleep(1)
except KeyboardInterrupt:
	GPIO.cleanup()
