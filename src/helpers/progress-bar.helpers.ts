// Initialiser la barre de progression
import cliProgress from "cli-progress";

export class ProgressBarHelpers {
    public progressBar: cliProgress.SingleBar;
    public total: number = 0;
    public current: number = 0;

    constructor(name: string, total: number){
        this.progressBar = new cliProgress.SingleBar({
            format: `${name} |{bar}| {percentage}% || {value}/{total} docs\n`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });

        this.progressBar.start(total, 0);
    }

    public update(total?: number){
        this.current += total ?? 1;
        this.progressBar.update(this.current);
    }

    public stop(){
        this.progressBar.stop();
    }
}
