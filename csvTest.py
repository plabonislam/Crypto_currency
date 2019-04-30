import csv
x = []
y = []
day = 30
degree = 5

with open('BTC.csv', 'r') as f:
    sreader = csv.reader(f)

    i = 0 
    for row in sreader:
        if i > 0 and i < day:
        	x.append(i)
        	y.append(float(row[2]))

        i = i + 1

#print x
print y[0]

y.reverse()
import matplotlib.pyplot as plt
import numpy as np
plt.plot(x,y)
plt.ylabel('BTC')

z = np.polyfit(x, y, degree)
f = np.poly1d(z)
print f(day)
for x1 in np.linspace(1, day , day):
    plt.plot(x1, f(x1), 'ro')
plt.show()


i = 0
errT = 0
while i < day - 1:
	errT = errT + (abs(f(i) - y[i])*100) / y[i]
	#print errT

	i = i + 1

print errT/(day-1)
