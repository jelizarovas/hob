#!/bin/bash

# Array of major car manufacturers
manufacturers=("Honda" "Toyota" "Ford" "Chevrolet" "Nissan")

# Set the current year and calculate the start year
current_year=$(date +'%Y')
start_year=$((current_year - 4))

# Prepare the JSON output
json_output='['

# Loop through each manufacturer
for manufacturer in "${manufacturers[@]}"; do
  # Loop through each year from start_year to current_year
  for ((year=start_year; year<=current_year; year++)); do
    # API endpoint to retrieve models for the specific manufacturer and year
    api_url="https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${manufacturer}/modelyear/${year}?format=json"

    # Send a GET request to the API and store the response in a variable
    response=$(curl -s "$api_url")

    # Extract the model data from the response
    model_data=$(echo "$response" | sed -n 's/.*"Model_Name":"\([^"]*\).*/\1/p')

    # Loop through each model and add it to the JSON output
    while IFS= read -r model; do
      json_output+='{"year":'${year}',"manufacturer":"'${manufacturer}'","model":"'${model}'"},'
    done <<< "$model_data"
  done
done

json_output=${json_output%,}  # Remove the trailing comma
json_output+=']'

# Save the JSON data to a file named "car_data.json"
echo "$json_output" > car_data.json

echo "Car data has been retrieved and saved to car_data.json"
