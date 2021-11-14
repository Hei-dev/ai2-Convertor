/**
 * Return the relavant extra properties codes of the ai2 elements
 * @param {JSON} ai2obj The ai2 element
 * @returns {String} the properties HTML codes
 */
function genExtra(ai2obj){ //Gen extra attributes such as src, onclick
    var extra = ''
    //console.log(ai2obj)
    for(var istr in ai2ext.Extra){
        //console.log(istr in ai2obj)
        if(istr in ai2obj){
            //console.log(istr)
            //console.log(ai2obj[istr])
            if(typeof ai2ext.Extra[istr].value!='string'){
                extra += ai2ext.Extra[istr].id + ai2ext.Extra[istr].value[ai2obj[istr]] + ' '
            }
            else{
                extra += ai2ext.Extra[istr].id + ai2obj[istr] + ai2ext.Extra[istr].value + ' '
            }
        }
    }
    return extra
}

/**
 * Return the relavant style codes of the ai2 elements
 * @param {JSON} ai2obj The ai2 element
 * @returns {String} the CSS codes, wrapped in `style=' '`
 */
function getStyle(ai2obj){ //ai2obj = component json data
    /*
        TODO Replace all the in statement with a loop
        which loop through all the keys
        and match them with the json file.
        (Only one 'in' statement is required)
        /\ /\Already Done/\ /\
        Note that is may or may not be the best method
        and is subject to change
    */
    var style = ''

    if((ai2obj.$Type == 'HorizontalScrollArrangement') || (ai2obj.$Type == 'HorizontalArrangement')){
        style = 'display:inline-flex;'
    }
    if((ai2obj.$Type == 'VerticalScrollArrangement') || (ai2obj.$Type == 'VerticalArrangement')){
        style = 'display:block;'
    }

    //console.log(ai2obj)
    for(var istr in ai2sty.Style){
        //console.log(istr in ai2obj)
        if(istr in ai2obj){
            //console.log(istr)
            //console.log(ai2obj.TextAlignment)
            //console.log(ai2obj[istr])
            if(typeof ai2sty.Style[istr].value!='string'){
                style += ai2sty.Style[istr].id + ai2sty.Style[istr].value[ai2obj[istr]] + ';'
            }
            else{
                if(ai2sty.Style[istr].isColorHex) {
                    style += ai2sty.Style[istr].id + ai2obj[istr].replace("&HFF", "#") + ai2sty.Style[istr].value + ';'
                } else {
                style += ai2sty.Style[istr].id + ai2obj[istr] + ai2sty.Style[istr].value + ';'
                }
            }
        }
    }



    //No Style Check
    if(style != ''){
        style = 'style="' + style + '"';
    }
    return style
}

/**
 * Convert the ai2 object to a HTML Element 
 * @param {JSON} ai2obj  - the ai2 JSON  
 */
function getElement(ai2obj){ //TODO Change these to reference json file for dict on converting
    checkLog(ai2obj) //Check if the element is incompactable. If incompactable show a log message
    if(ai2obj.$Type in ai2cmp.Tag){ //If the ai2 element is in the convertor's dictionary
        if(ai2obj.Text === undefined){ //if the ai2 element does not contains text
            if((ai2obj.$Type == 'HorizontalScrollArrangement') || (ai2obj.$Type == 'HorizontalArrangement') || (ai2obj.$Type == 'VerticalScrollArrangement') || (ai2obj.$Type == 'VerticalArrangement')){
                //if the ai2 element is an Arrangement
                var innerContent = "" // The inner elements' HTML code
                for(var j=0;j<ai2obj.$Components.length;j++){
                    innerContent += getElement(ai2obj.$Components[j]) //[CONVERT PROCEDURE] getting the inner content be converted
                }
                return '<' + 'div' + ' id="' + ai2obj.$Name + '" ' + getStyle(ai2obj) + genExtra(ai2obj) + '>'
                    + innerContent + '</' + 'div' +'>\n<br>'; //Format the Arrangement to a div
            }
            else{ //If it is not an Arrangement
            return '<' + ai2cmp.Tag[ai2obj.$Type] + ' id="' + ai2obj.$Name + '" ' + getStyle(ai2obj) + genExtra(ai2obj) + '>'
                + '</' + ai2cmp.Tag[ai2obj.$Type] +'>\n<br>'; //Generate the element w/ style and other properties
            }
        }
        else{ //If it does contains text
            return '<' + ai2cmp.Tag[ai2obj.$Type] + ' id="' + ai2obj.$Name + '" ' + getStyle(ai2obj) + genExtra(ai2obj) + '>'
                + ai2obj.Text + '</' + ai2cmp.Tag[ai2obj.$Type] +'>\n<br>'; //Generate the element w/ style and other properties
        }
    }
    else{
        return ''//The ai2 element cannot be converted
    }
    
}

/**
 * Returns the HTML codes from the JSON codes in the .scm file
 * @param {JSON} obj - The JSON object to be converted
 */
function jsonToHTML(obj){
    var hcode = '<html><head><meta charset="UTF-8"><title>' //Initalize the default html code
            + obj.AppName + '/' + obj.$Name
            + '</title></head>\n<body>\n<div style="">'
    for(var i=0;i<obj.$Components.length;i++){ //For every componets in the screen
        try{
            hcode += getElement(obj.$Components[i]) //[CONVERT PROCEDURE]
            //Convert each of them binto HTML elements
        }
        catch(ierr){
            console.log("ERROR WHILE CONVERTING: " + ierr)
            document.getElementById("logs").innerHTML += "<label style='color:red'>ERROR WHILE CONVERTING "
                + obj.$Components[i] + ":" + ierr + "</label><br>"
        }
    }
    hcode += '</div></body></html>' //Close the HTML code
    display(hcode)
    return hcode
}

/**
 * Display the html on screen. \
 * DO NOT use this function without modifing this function
 * as these are only made for this project's index.html
 * @param {String} hcode the HTML Code
 */
function display(hcode){
    document.getElementById('prev').innerHTML = hcode
    var htmlDoc = null
    var htmlDatas = new Blob([hcode], {type: 'text/plain'});
    if (hcode !== null) {
        window.URL.revokeObjectURL(htmlDoc);
    }
    document.getElementById("save").innerHTML = "<a style='font-size:30vm'"
        + " href=\"" + window.URL.createObjectURL(htmlDatas)
        + "\" download='" + obj.$Name + ".html'>Download HTML File</a>";
}


/**
 * Returns the HTML code from a .scm file
 * @param {FileReader} scmfile - The .scm file 
 */
function scmToHTML(scmfile){
    var tScm = scmfile.split("\n"); //Split the files text into lines
    try{
        scn = JSON.parse(tScm[2]); //Only the second line is the JSON file, so read that.
        jsonToHTML(scn.Properties) //Starting the converting process
    }
    catch(err){
        console.log("APPLICATION ERROR:" + err)
        document.getElementById("logs").innerHTML += "<label style='color:red'>APPLICATION ERROR: " + err + "\nEnding process...</label><br>"
    }
}


var scn;
    //Read the file
    //If you wish to import String and convert it, look for scmToHtml() or jsonToHTML()
    document.getElementById("cFile").addEventListener("change",function(e){
        var f = new FileReader();
        
        f.onload = function(){
            //console.log("fbh");
            var tScm = f.result.split("\n");
            try{
                scn = JSON.parse(tScm[2]);
                console.log(scn);
                jsonToHTML(scn.Properties)
            }
            catch(err){
                console.log("APPLICATION ERROR:" + err)
                document.getElementById("logs").innerHTML += "<label style='color:red'>APPLICATION ERROR: " + err + "\nEnding process...</label><br>"
            }
            
        }
        f.readAsText(e.target.files[0]);
    });