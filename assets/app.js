var apigClient = apigClientFactory.newClient({ apiKey: '' });
var SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();

search_button = document.getElementById('mic_search');
upload_button = document.getElementById('uploadPhoto');
mic = document.getElementById('mic');
search_button.addEventListener('click', () => {
    search();
})
upload_button.addEventListener('click', () => {
    uploadPhoto();
})

mic.addEventListener("click", () => {
    searchFromVoice()
})


///// SEARCH TRIGGER //////
function searchFromVoice() {
    recognition.start();
    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        console.log(speechToText);
        document.getElementById("search_image_input").value = speechToText;
        search();
    }
}

function search() {
    // var apigClient = apigClientFactory.newClient();
    var searchTerm = document.getElementById("search_image_input").value;
    var params = { q: searchTerm, 'x-api-key': 'YDUAQyW841a6iMd4TUCpA8grI32neNsg83L0WTrY' };
    apigClient.searchGet(params, {}, {})
        .then(function (res) {
            console.log("success");
            console.log(res.data.imagePaths);
            showImages(res.data)
        }).catch(function (result) {
            console.log(result);
            showImages(result.data)
            console.log("NO RESULT");
        });
}

function showImages(res) {
    var newDiv = document.getElementById("images");
    if (typeof (newDiv) != 'undefined' && newDiv != null) {
        while (newDiv.firstChild) {
            newDiv.removeChild(newDiv.firstChild);
        }
    }

    if (res == null) {
        var newContent = document.createTextNode("No images to display");
        newDiv.appendChild(newContent);
    }
    else {
        results = res.imagePaths
        for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
            var newDiv = document.getElementById("images");
            var newimg = document.createElement("img");
            filename = results[i].substring(results[i].lastIndexOf('/') + 1)
            newimg.src = "https://jash-b2.s3.amazonaws.com/" + filename;
            newDiv.appendChild(newimg);
        }
    }
}

// function uploadPhoto() {
//     var filePath = (document.getElementById('customFile').value).split("\\");
//     var fileName = filePath[filePath.length - 1];
//     var reader = new FileReader();
//     var file = document.getElementById('customFile').files[0];
//     const fileType = file['type'];
//     document.getElementById('customFile').value = "";
//     const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

//     if (!validImageTypes.includes(fileType)) {
//         alert('Please upload a valid image');
//     } else {
//         reader.onload = function (e) {
//             var src = e.target.result;
//             var newImage = document.createElement("img");
//             newImage.src = src;
//             encoded = newImage.outerHTML;
//             last_index_quote = encoded.lastIndexOf('"');
//             encodedStr = encoded.substring(33, last_index_quote);
//             var apigClient = apigClientFactory.newClient({ apiKey: "" });
//             var params = {
//                 "key": fileName,
//                 "bucket": "jash-b2",
//                 "Content-Type": fileType,
//             };

//             var additionalParams = {
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     // "Access-Control-Allow-Methods": "PUT",
//                     "Content-Type": fileType,
//                 }
//             };
//             // var params = {  };
//             // var additionalParams = {
//             //     headers: {
//             //         "Access-Control-Allow-Origin": "*",
//             //         "Content-Type": fileType,
//             //     }
//             // };
//             apigClient.uploadBucketKeyPut(params, encodedStr, additionalParams)
//                 .then(function (result) {
//                     console.log(result);
//                     console.log('success OK');
//                     alert("Photo Uploaded Successfully");
//                 })
//                 .catch(function (result) {
//                     console.log(result);
//                 });
//         }
//         reader.readAsBinaryString(file);
//     }
// }


// function uploadPhoto() {
//     var filePath = (document.getElementById('customFile').value).split("\\");
//     var fileName = filePath[filePath.length - 1];
//     if (!document.getElementById('image_tags').innerText == "") {
//         var customLabels = document.getElementById('image_tags');
//     }
//     console.log(fileName);
//     console.log(image_tags.value);
//     var reader = new FileReader();
//     var file = document.getElementById('customFile').files[0];
//     console.log('File : ', file);
//     document.getElementById('customFile').value = "";
//     if ((fileName == "") || (!['png', 'jpg', 'jpeg'].includes(fileName.split(".")[1]))) {
//         alert("Please upload a valid .png/.jpg/.jpeg file!");
//     } else {
//         var additionalParams = {
//             headers: {
//                 'Access-Control-Allow-Origin': '*',
//                 'Content-Type': file.type
//             }
//         };
//         reader.onload = function (event) {
//             body = btoa(event.target.result);
//             // console.log('Reader body : ', body);
//             url = "https://heubgfnx85.execute-api.us-east-1.amazonaws.com/dev/upload/jash-b2/" + fileName
//             axios.put(url, file, additionalParams).then(response => {
//                 alert("Image Uploaded: " + fileName);
//             });


//         }
//         reader.readAsBinaryString(file);
//     }
// }

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
            if (encoded.length % 4 > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = (error) => reject(error);
    });
}

function uploadPhoto() {
    var file = document.getElementById('customFile').files[0];
    const fileType = file['type'];
    document.getElementById('customFile').value = "";
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    // console.log(file);
    if (!validImageTypes.includes(fileType)) {
        alert('Please upload a valid image');
    } else {
        var encoded_image = getBase64(file).then((data) => {
            // console.log(data);
            // var apigClient = apigClientFactory.newClient();
            var tags = document.getElementById("image_tags").value;
            document.getElementById("image_tags").value = '';
            var file_type = file.type + ';base64';
            // var params = {

            // }
            var additionalParams = {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": file.type,
                    "x-amz-meta-customLabels": tags,
                }
            };
            url = "https://heubgfnx85.execute-api.us-east-1.amazonaws.com/dev/upload/jash-b2/" + file.name
            axios.put(url, file, additionalParams).then(response => {
                alert("Image Uploaded: " + file.name);
            });
        });
    }
}