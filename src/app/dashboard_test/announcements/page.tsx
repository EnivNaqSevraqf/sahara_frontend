'use client';
import * as React from "react";
import EditorJS from '@editorjs/editorjs';

import { Box } from "@mui/material";

export default function AnnouncementsPage() {

    const editor = new EditorJS({ 
    /** 
     * Id of Element that should contain the Editor 
     */ 
    holder: 'editorjs', 
    })
    return (
        <Box>
        <div id="editorjs"></div>
        </Box>
    );
}

