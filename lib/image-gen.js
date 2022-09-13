const fs = require("fs");
const cwebp = require("cwebp");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

// This functiona accepts 5 arguments:
// canonicalName: this is the name we'll use to save our image
// gradientColors: an array of two colors, i.e. [ '#ffffff', '#000000' ], used for our gradient
// articleName: the title of the article or site you want to appear in the image
// articleCategory: the category which that article sits in - or the subtext of the article
// emoji: the emoji you want to appear in the image.
const generateMainImage = async function (canonicalName, cords) {
	// Create canvas
	const canvas = createCanvas(800, 800);
	const ctx = canvas.getContext("2d");

	const template = await loadImage("./tictactoe.png");

	const circle = await loadImage("./circle.png");
	const cross = await loadImage("./cross.png");

	ctx.drawImage(template, 0, 0);

	cords.forEach((cordsRow, i) => {
		const y = i * 266 + 80;
		cordsRow.forEach((cords, i) => {
			if (cords === "X" || cords === "O") {
				const x = i * 266 + 80;
				ctx.drawImage(cords === "X" ? cross : circle, x, y);
			}
		});
	});

	if (fs.existsSync(`./images/${canonicalName}.png`)) {
		return "Images Exist! We did not create any";
	} else {
		// Set canvas as to png
		try {
			const canvasData = await canvas.toBuffer("image/png", {
				compressionLevel: 3,
				filters: canvas.PNG_FILTER_NONE,
			});
			// Save file
			fs.writeFileSync(`./images/${canonicalName}.png`, canvasData);
		} catch (e) {
			console.log(e);
			return "Could not create png image this time.";
		}
		try {
			const encoder = new cwebp.CWebp(
				path.join(__dirname, "../", `/images/${canonicalName}.png`)
			);
			encoder.quality(30);
			await encoder.write(`./images/${canonicalName}.webp`, function (err) {
				if (err) console.log(err);
			});
		} catch (e) {
			console.log(e);
			return "Could not create webp image this time.";
		}

		return "Images have been successfully created!";
	}
};

// This function accepts 6 arguments:
// - ctx: the context for the canvas
// - text: the text we wish to wrap
// - x: the starting x position of the text
// - y: the starting y position of the text
// - maxWidth: the maximum width, i.e., the width of the container
// - lineHeight: the height of one line (as defined by us)
const wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
	// First, split the words by spaces
	let words = text.split(" ");
	// Then we'll make a few variables to store info about our line
	let line = "";
	let testLine = "";
	// wordArray is what we'l' return, which will hold info on
	// the line text, along with its x and y starting position
	let wordArray = [];
	// totalLineHeight will hold info on the line height
	let totalLineHeight = 0;

	// Next we iterate over each word
	for (var n = 0; n < words.length; n++) {
		// And test out its length
		testLine += `${words[n]} `;
		var metrics = ctx.measureText(testLine);
		var testWidth = metrics.width;
		// If it's too long, then we start a new line
		if (testWidth > maxWidth && n > 0) {
			wordArray.push([line, x, y]);
			y += lineHeight;
			totalLineHeight += lineHeight;
			line = `${words[n]} `;
			testLine = `${words[n]} `;
		} else {
			// Otherwise we only have one line!
			line += `${words[n]} `;
		}
		// Whenever all the words are done, we push whatever is left
		if (n === words.length - 1) {
			wordArray.push([line, x, y]);
		}
	}

	// And return the words in array, along with the total line height
	// which will be (totalLines - 1) * lineHeight
	return [wordArray, totalLineHeight];
};

exports.generateMainImage = generateMainImage;
