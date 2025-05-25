import "./style.css";
import { FunctionComponent as FC } from "preact";
export interface TitleProp {
  title: string;
}

export const Title: FC<TitleProp> = ({ title }) => {
  return <div class="my-3 title">{title}</div>;
};
