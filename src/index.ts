import { checkSeverity, getProfanityWordsList } from "./utils/functions";

class TrieNode {
    children: { [char: string]: TrieNode };
    isEndOfWord: boolean;

    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    // Method to insert a word into the trie
    insert(word: string): void {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    // Method to search for a word in the trie
    search(word: string): boolean {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return false; // Word not found
            }
            node = node.children[char];
        }
        return node.isEndOfWord; // Return true if the end of word marker is set
    }
}

const detectProfanity = async ({ text }: { text: string }) => {

    const profanityTrie = new Trie();

    // Insert profanity words into the trie
    const profanityWords: string[] = await getProfanityWordsList('utils/profanity.csv', 'text');
    if (!profanityWords.length) {
        throw new Error('Error occurred or column not found.');
    }

    profanityWords.forEach((word: string) => {
        profanityTrie.insert(word);
    });

    const words: string[] | null = text.toLowerCase().match(/\b\w+\b/g); // Tokenize text into words

    const totalProfanityCount: Set<string> = new Set();

    if (words) {
        for (let word of words) {
            if (profanityTrie.search(word)) {
                totalProfanityCount.add(word);
            }
        }
    }

    if (totalProfanityCount.size) {
        // @ts-ignore 
        const severityDescription: Set<string> = await findProfanityData('utils/profanity.csv', [...totalProfanityCount], ProfanityCSVColumns.severity_description);
        // @ts-ignore 
        const severityRating: Set<number> = await findProfanityData('utils/profanity.csv', [...totalProfanityCount], ProfanityCSVColumns.severity_rating);

        const serverityDesc = checkSeverity(severityDescription)

        return {
            serverityDesc,
            profanityWords: totalProfanityCount,
            severityRating
        }

    }
    return;
}

export default detectProfanity;