import csvParser from "csv-parser";
const fs = require('fs');

enum ProfanityCSVColumns {
    severity_description = "severity_description",
    severity_rating = "severity_rating"
}

interface ProfanityRow {
    text: string;
    [key: string]: string;
}

export const getProfanityWordsList = (filePath: string, columnName: string) => {
    return new Promise<string[]>((resolve, reject) => {
        // Array to store the elements from the specified column
        let columnArray: string[] = [];

        // Read the CSV file and extract elements from the specified column
        const readStream = fs.createReadStream(filePath);

        readStream
            .on('error', (error: any) => {
                console.error('Error reading the file:', error);
                reject(error); // Reject the promise if there's an error
            })
            .pipe(csvParser())
            .on('data', (row: any) => {
                // Check if the specified column exists in the row
                if (row.hasOwnProperty(columnName)) {
                    // Push the element from the specified column to the array
                    columnArray.push(row[columnName]);
                } else {
                    console.error(`Column '${columnName}' not found in the CSV file.`);
                    reject(new Error(`Column '${columnName}' not found`)); // Reject if column not found
                }
            })
            .on('end', () => {
                // If the array is empty, resolve with an empty array
                if (columnArray.length === 0) {
                    resolve([]);
                } else {
                    // Otherwise, resolve with the array
                    resolve(columnArray);
                }
            });
    });
}


export async function findProfanityData(filePath: string, searchTerms: string[], columnName: ProfanityCSVColumns) {
    return new Promise((resolve, reject) => {
        // Set to store unique severity ratings
        const severityRatings = new Set();

        // Read the CSV file and search for each word under the specified column
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row: ProfanityRow) => {
                if (searchTerms.includes(row.text)) {
                    // If the word is found in the search terms, add its severity rating to the set
                    severityRatings.add(row[columnName]);
                }
            })
            .on('end', () => {
                // Resolve with the set containing unique severity ratings
                resolve(severityRatings);
            })
            .on('error', (error: any) => {
                // Reject the promise if there's an error
                console.error('Error reading the file:', error);
                reject(error);
            });
    });
}

// Function to check severity level
export function checkSeverity(severitySet: Set<string>): string | undefined {
    for (const severity of ['Severe', 'Strong', 'Mild']) {
        if (severitySet.has(severity)) {
            return severity;
        }
    }
    return;
}