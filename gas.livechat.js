// https://script.google.com/macros/s/AKfycby2Houyv0o2GEQnNeDqWjGiH05Sy4a0m_8CGWQMZCd1dzu1fVw0IsvJZ7SLGPehCvIjnA/exec

const RESPONSE_STATUS = {
    SUCCESS: "success",
    ERROR: "error",
    OK: "ok"
};

function respond(data, statusCode = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

function doGet(e) {
    if (!e) e = { parameter: {} };

    try {
        const action = e.parameter.action;

        if (action === "getFile") {
            return getFile(e.parameter.fileUrl || e.parameter.fileId);
        }

        return respond({ status: RESPONSE_STATUS.OK, message: "Hybrid Server is running (Upload and Proxy Only)" });
    } catch (error) {
        return respond({ status: RESPONSE_STATUS.ERROR, message: error.toString() }, 500);
    }
}

function doPost(e) {
    try {
        const data = e.parameter;

        if (!data.action) {
            return respond({ status: RESPONSE_STATUS.ERROR, message: "Missing action" }, 400);
        }

        const action = data.action;

        if (action === "upload") {
            return uploadFile(data);
        }

        return respond({ status: RESPONSE_STATUS.ERROR, message: "Only upload action is supported in hybrid mode" }, 400);

    } catch (error) {
        return respond({ status: RESPONSE_STATUS.ERROR, message: error.toString() }, 500);
    }
}

// ========================================
// FILE UPLOAD UTILITY
// ========================================

function uploadFile(data) {
    try {
        if (!data.fileData || !data.fileName || !data.mimeType) {
            return respond({ status: RESPONSE_STATUS.ERROR, message: "Missing file data" }, 400);
        }

        const FOLDER_ID = "1lzhmxa0C5KAT--7fZwfjocIO7AfLCofk";
        const folder = DriveApp.getFolderById(FOLDER_ID);

        let base64Data = data.fileData;
        if (base64Data.indexOf("base64,") !== -1) {
            base64Data = base64Data.split("base64,")[1];
        }

        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, data.fileName);
        const file = folder.createFile(blob);

        try {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareError) {
            // Ignore sharing error if organization restricts it
        }

        const fileName = file.getName();
        const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';

        const fileId = file.getId();
        const fileUrl = `https://drive.google.com/uc?export=view&id=${fileId}${ext ? '#.' + ext : ''}`;

        return respond({
            status: RESPONSE_STATUS.SUCCESS,
            fileUrl: fileUrl,
            fileName: fileName
        });

    } catch (error) {
        return respond({ status: RESPONSE_STATUS.ERROR, message: error.toString() }, 500);
    }
}

// ========================================
// GET FILE UTILITY (BASE64 PROXY)
// ========================================

function getFile(fileUrlOrId) {
    try {
        if (!fileUrlOrId) {
            return respond({ status: RESPONSE_STATUS.ERROR, message: "Missing file ID" }, 400);
        }

        let fileId = fileUrlOrId;
        if (fileUrlOrId.indexOf('id=') !== -1) {
            const match = fileUrlOrId.match(/id=([a-zA-Z0-9_-]+)/);
            if (match) {
                fileId = match[1];
            }
        }

        const file = DriveApp.getFileById(fileId);
        const mimeType = file.getMimeType();
        const bytes = file.getBlob().getBytes();
        const base64 = Utilities.base64Encode(bytes);
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return respond({
            status: RESPONSE_STATUS.SUCCESS,
            fileData: dataUrl,
            fileName: file.getName(),
            mimetype: mimeType
        });
    } catch (error) {
        return respond({ status: RESPONSE_STATUS.ERROR, message: error.toString() }, 500);
    }
}
