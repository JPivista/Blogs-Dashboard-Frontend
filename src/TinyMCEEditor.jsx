import React, { useRef, useEffect } from 'react';

function TinyMCEEditor({ value, onChange }) {
    const editorRef = useRef();

    useEffect(() => {
        if (window.tinymce && editorRef.current) {
            window.tinymce.init({
                target: editorRef.current,
                plugins: 'lists link image code',
                toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
                menubar: false,
                branding: false,
                height: 300,
                setup: (editor) => {
                    editor.on('init', () => {
                        editor.setContent(value || '');
                    });
                    editor.on('Change KeyUp', () => {
                        onChange(editor.getContent());
                    });
                },
                images_upload_handler: (blobInfo) => {
                    return new Promise((resolve, reject) => {
                        resolve('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
                    });
                }
            });

            return () => {
                if (window.tinymce) {
                    window.tinymce.remove(editorRef.current);
                }
            };
        }
    }, []);

    return (
        <div>
            <label>Description</label>
            <textarea ref={editorRef} />
        </div>
    );
}

export default TinyMCEEditor;
