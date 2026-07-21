FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies if any are needed (e.g. postgres client)
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Expose Django port
EXPOSE 8000

# Copy start script
RUN chmod +x /app/start.sh 2>/dev/null || true

# Run application using start.sh (which runs migrations first)
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 tasksphere.wsgi:application"]
