'use client';
import * as React from "react";
import EditorJS from '@editorjs/editorjs';

export default function AnnouncementsPage() {

    const editor = new EditorJS({ 
    /** 
     * Id of Element that should contain the Editor 
     */ 
    holder: 'editorjs', 
    })
    return (
        <div id="editorjs"></div>
    );
}

