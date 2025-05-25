import { FunctionComponent as FC } from "preact";
import { ConstantRange } from "../../services/chart-data";

export interface ConstantRangeSelectProp {
  submitText?: string;
  disabled: boolean;
  onSubmit: (range: ConstantRange) => void;
}

export const ConstantRangeSelect: FC<ConstantRangeSelectProp> = ({ submitText, disabled, onSubmit }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) {
          return;
        }
        const data = new FormData(form);
        onSubmit({
          min: +(data.get("min-constant") || -Infinity),
          max: +(data.get("max-constant") || Infinity),
        });
      }}
    >
      <div class="input-group my-3">
        <input
          id="min-constant"
          class="form-control"
          type="number"
          step="0.1"
          name="min-constant"
          disabled={disabled}
        ></input>
        <div class="input-group-text">≤定数≤</div>
        <input
          id="max-constant"
          class="form-control"
          type="number"
          step="0.1"
          name="max-constant"
          disabled={disabled}
        ></input>
        <button class="btn btn-primary" type="submit" disabled={disabled}>
          {submitText || "确认"}
        </button>
      </div>
    </form>
  );
};
