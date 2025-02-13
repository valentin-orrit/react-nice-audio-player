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

# Loop through all audio files in the directory (assuming WAV files)
for audio_file in "$INPUT_DIR"/*.wav; do
  # Skip if no WAV files are found
  if [ ! -f "$audio_file" ]; then
    echo "No audio files found in the directory."
    exit 1
  fi

  # Generate a name for the output JSON file
  json_file="${audio_file%.wav}.json"

  # Run audiowaveform command to generate the waveform data
  audiowaveform -i "$audio_file" -o "$json_file" --pixels-per-second 50 --bits 8

  echo "Generated waveform for: $audio_file"
done

echo "Waveform generation complete for all audio files."
