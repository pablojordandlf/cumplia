# Use an official Python runtime as a parent image
FROM python:3.12-slim-bullseye

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY ./apps/api/requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY ./apps/api/ /app/

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV PYTHONUNBUFFERED=1

# Run main.py using uvicorn
# The command to run the application.
# Use --host 0.0.0.0 to allow connections from any IP address.
# Use --port 8000 to specify the port.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
