"use strict";

import {TextRenderer} from './textrenderer';
import {DefaultRenderer} from './defaultrenderer';
import {ImageRenderer} from './imagerenderer';
import {HTMLRenderer} from './htmlrenderer';

/**
 * Transforms mimetypes into HTMLElements
 */
export class Transformime {

    /**
     * Public constructor
     * @param  {RendererBase[]} renderers       list of renderers, in reverse
     *                                          priority order
     * @param  {RendererBase} fallbackRenderer  renderer to default to when a
     *                                          mimetype is unsupported
     */
    constructor(renderers, fallbackRenderer) {

        // Initialize instance variables.
        this.renderers = renderers || [
            new TextRenderer(),
            new ImageRenderer('image/png'),
            new ImageRenderer('image/jpeg'),
            new HTMLRenderer()
        ];
        this.fallbackRenderer = fallbackRenderer || new DefaultRenderer();
    }

    /**
     * Transforms a mime bundle, using the richest available representation,
     * into an HTMLElement.
     * @param  {any}      bundle {mimetype1: data1, mimetype2: data2, ...}
     * @param  {Document} doc    Any of window.document, iframe.contentDocument
     * @return {HTMLElement}
     */
    transformRichest(bundle, doc) {
        let element;
        let richRenderer = this.fallbackRenderer;

        // Choose the last renderer as the most rich
        for (let renderer of this.renderers) {
            if (bundle.data && renderer.mimetype in bundle.data) {
                richRenderer = renderer;
            }
        }

        if (bundle.data){
            let data = bundle.data[richRenderer.mimetype];
            return this.transform(data, richRenderer.mimetype, doc);
        }

        throw new Error('Renderer for ' + Object.keys(bundle).join(', ') + ' not found.');
    }

    /**
     * Transforms all of the mime types in a mime bundle into HTMLElements.
     * @param  {object} bundle - mime bundle
     * @return {HTMLElement[]}
     */
    transformAll(bundle, doc) {
        return bundle.map(function(mimetype) { return this.transformMimetype(bundle[mimetype], mimetype, doc); });
    }

    /**
     * Transforms a specific mime type into an HTMLElement.
     * @param  {object} data
     * @param  {string} mimetype
     * @return {HTMLElement}
     */
    transform(data, mimetype, doc) {
        let renderer = this.get_renderer(mimetype);
        if (renderer) {
            return renderer.transform(data, doc || document);
        }

        throw new Error('Renderer for mimetype ' + mimetype + ' not found.');
    }

    /**
     * Gets a renderer matching the mimetype
     * @param  string mimetype the data type (e.g. text/plain, text/html, image/png)
     * @return {Renderer} Matching renderer
     */
    get_renderer(mimetype) {
        for (let renderer of this.renderers) {
            if (mimetype === renderer.mimetype) {
                return renderer;
            }
        }
        return null;
    }
}
