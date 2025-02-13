#!/bin/bash

# Directory containing audio files
INPUT_DIR="$1"

# Check if the directory is provided
if [ -z "$INPUT_DIR" ]; then
  echo "Please provide a directory containing audio files."
  exit 1
fi

# Ensure the directory exists
if [ ! -d "$INPUT_DIR" ]; then
  echo "Directory not found: $INPUT_DIR"
  exit 1
fi

# Function to calculate pixels-per-second based on the file's duration.
# Uses bc and awk to handle floating point arithmetic.
calculate_pixels_per_second() {
  local duration=$1
  local max_resolution=100  # Maximum pixels per second for short files
  local min_resolution=10   # Minimum pixels per second for long files

  # If duration is less than or equal to 3 seconds, use max resolution.
  if [ "$(echo "$duration <= 3" | bc -l)" -eq 1 ]; then
    echo "$max_resolution"
  else
    echo "$min_resolution"
  fi
}

# Loop through all WAV files in the directory.
for audio_file in "$INPUT_DIR"/*.wav; do
  # Skip if no WAV files are found.
  if [ ! -f "$audio_file" ]; then
    echo "No audio files found in the directory."
    continue
  fi

  # Get the duration of the audio file using ffprobe.
  duration=$(ffprobe -i "$audio_file" -show_entries format=duration -v quiet -of csv="p=0")
  
  # Calculate pixels-per-second based on the file's duration.
  pixels_per_second=$(calculate_pixels_per_second "$duration")

  # Generate a name for the output JSON file.
  json_file="${audio_file%.wav}.json"

  # Run audiowaveform to generate the waveform JSON.
  audiowaveform -i "$audio_file" -o "$json_file" --pixels-per-second "$pixels_per_second" --bits 8

  echo "Generated waveform for: $audio_file with pixels-per-second: $pixels_per_second"
done

echo "Waveform generation complete for all audio files."
