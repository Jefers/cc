from matplotlib import pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
from datetime import datetime, timedelta

# Define project phases with durations
phases = [
    ("Foundation & Alignment", "2025-01-01", "2025-01-31"),
    ("Systems & Content Launch", "2025-02-01", "2025-03-31"),
    ("Client Experience", "2025-04-01", "2025-05-31"),
    ("Community Membership", "2025-06-01", "2025-06-30"),
    ("Team & Scale Prep", "2025-07-01", "2025-08-31"),
    ("First Retreat", "2025-09-01", "2025-09-30"),
    ("Life Balance & Leverage", "2025-10-01", "2025-11-30"),
    ("International Scale", "2025-12-01", "2025-12-31")
]

# Convert to DataFrame
df = pd.DataFrame(phases, columns=["Phase", "Start", "End"])
df["Start"] = pd.to_datetime(df["Start"])
df["End"] = pd.to_datetime(df["End"])
df["Duration"] = df["End"] - df["Start"]

# Plot Gantt chart
fig, ax = plt.subplots(figsize=(12, 6))

for i, row in df.iterrows():
    ax.barh(row["Phase"], row["Duration"].days, left=row["Start"], color="#4CAF50")

# Format the x-axis as dates
ax.xaxis.set_major_locator(mdates.MonthLocator(interval=1))
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
plt.xticks(rotation=45)
plt.title("Built for More - 12-Month Project Gantt Chart")
plt.xlabel("Timeline")
plt.ylabel("Project Phase")
plt.grid(True, which='major', axis='x', linestyle='--', alpha=0.7)
plt.tight_layout()

# Save image
output_path = "/mnt/data/Built_For_More_Project_Timeline_Gantt.png"
plt.savefig(output_path)

output_path
