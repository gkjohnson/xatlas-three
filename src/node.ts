import {Atlas, BaseUVUnwrapper} from "./UVUnwrapper";
import {XAtlasNodeWorker} from "./XAtlasNodeWorker";
import {createRequire} from "node:module";
import path from "node:path";

export class UVUnwrapper extends BaseUVUnwrapper{
    protected _createXAtlas(): any {
        return new XAtlasNodeWorker()
    }

    _libraryPromise: Promise<void>|null;

    constructor(...args) {
        super(...args);

        this._libraryPromise = this._loadLibrary();
    }

    async _loadLibrary(): Promise<void> {
        // https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules
        const require = createRequire(import.meta.url);
        const pathName = path.dirname(require.resolve('xatlasjs/package.json'));

        // Make sure to wait for the library to load before unwrapping.
        this._libraryPromise = super.loadLibrary(
            (mode, progress)=>{console.log(mode, progress);},
            `${pathName}/dist/node/xatlas.wasm`,
            `${pathName}/dist/node/worker.mjs`,
        );
    }

    public async packAtlas(...args): Promise<Atlas> {
        // wait for the library to be loaded
        await this._libraryPromise;
        return super.packAtlas(...args);
    }

    exit(): Promise<void> {
        return this.xAtlas?.api.exit();
    }
}
