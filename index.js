import { BasicSoundFont, loadSoundFont } from "spessasynth_lib";

const message = document.getElementById("message");
document.getElementById("dls_upload").oninput = e =>
{
    if (!e.target.files)
    {
        return;
    }
    const file = e.target.files[0];
    if (file.type.endsWith(".dls"))
    {
        message.innerText = "Not a DLS file.";
        return;
    }
    const dlsUploadButton = document.getElementById("dls_upload_btn");
    dlsUploadButton.innerText = file.name;
    message.innerText = "Loading...";
    setTimeout(async () =>
    {
        /**
         * @type {BasicSoundFont}
         */
        let sfont;
        try
        {
            sfont = loadSoundFont(await file.arrayBuffer());
        }
        catch (e)
        {
            message.style.color = "red";
            message.innerText = `Error: ${e.message}`;
            return;
        }
        document.getElementById("sf_info").classList.remove("hidden");
        document.getElementById("dls_name").innerText = sfont.soundFontInfo["INAM"] || "Unnamed";
        document.getElementById("dls_description").innerText = (sfont.soundFontInfo["ICMT"] || "No description").replace(
            "\nConverted from DLS to SF2 with SpessaSynth",
            ""
        );
        document.getElementById("dls_presets").innerText = sfont.presets.length.toString();
        document.getElementById("dls_samples").innerText = sfont.samples.length.toString();
        message.innerText = "Loaded!";
        
        const convert = document.getElementById("convert");
        convert.classList.remove("hidden");
        
        const downloadButton = document.getElementById("download");
        const downloadAnchor = downloadButton.firstElementChild;
        downloadButton.classList.add("hidden");
        
        convert.onclick = () =>
        {
            /**
             * @type {Uint8Array}
             */
            let binary;
            try
            {
                binary = sfont.write();
            }
            catch (e)
            {
                message.style.color = "red";
                message.innerText = `Error: ${e.message}`;
                return;
            }
            convert.classList.add("hidden");
            dlsUploadButton.innerText = "Convert another DLS";
            const blob = new Blob([binary.buffer], { type: "audio/soundfont" });
            const url = URL.createObjectURL(blob);
            const name = file.name.replace("dls", "sf2");
            downloadAnchor.href = url;
            downloadAnchor.download = name;
            downloadAnchor.innerText = `Download ${name}`;
            
            downloadButton.classList.remove("hidden");
            downloadButton.innerHTML = "";
            downloadButton.appendChild(downloadAnchor);
            message.style.color = "green";
            message.innerText = `Success!`;
        };
    });
};