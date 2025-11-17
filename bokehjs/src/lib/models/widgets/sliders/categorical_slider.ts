import type {SliderSpec} from "./abstract_slider"
import {AbstractSlider, AbstractSliderView} from "./abstract_slider"
import type * as p from "core/properties"
import {isNumber} from "core/util/types"

export class CategoricalSliderView extends AbstractSliderView<string> {
  declare model: CategoricalSlider

  override behaviour = "tap" as const

  override connect_signals(): void {
    super.connect_signals()

    const {categories} = this.model.properties
    this.on_change([categories], () => this._update_slider())
  }

  protected _calc_to(): SliderSpec<string> {
    const {categories} = this.model

    // determine numeric start index and clamp it into valid range
    const start_index = Math.max(0, Math.min(categories.indexOf(this.model.value), categories.length - 1))

    return {
      range: {
        min: 0,
        max: categories.length - 1,
      },
      start: [start_index] as any,
      step: 1,
      format: {
        to: (value: number) => {
          // value may be floating-point due to slider internals — round and clamp
          const index = Math.round(value)
          const clamped = Math.max(0, Math.min(index, categories.length - 1))
          return categories[clamped]
        },
        from: (value: string) => categories.indexOf(value),
      },
    }
  }

  protected _calc_from([value]: number[]): string {
    const {categories} = this.model
    // round and clamp to defend against FP imprecision
    const index = Math.round(value)
    const clamped = Math.max(0, Math.min(index, categories.length - 1))
    return categories[clamped]
  }

  pretty(value: number | string): string {
    const {categories} = this.model
    if (isNumber(value)) {
      const index = Math.round(value)
      const clamped = Math.max(0, Math.min(index, categories.length - 1))
      return categories[clamped]
    } else {
      // if a string (category name) was passed, return it unchanged
      return value
    }
  }
}

export namespace CategoricalSlider {
  export type Attrs = p.AttrsOf<Props>

  export type Props = AbstractSlider.Props & {
    categories: p.Property<string[]>
    value: p.Property<string>
    value_throttled: p.Property<string>
  }
}

export interface CategoricalSlider extends CategoricalSlider.Attrs {}

export class CategoricalSlider extends AbstractSlider<string> {
  declare properties: CategoricalSlider.Props
  declare __view_type__: CategoricalSliderView

  declare value: string
  declare value_throttled: string

  constructor(attrs?: Partial<CategoricalSlider.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = CategoricalSliderView

    this.define<CategoricalSlider.Props>(({List, Str}) => ({
      categories: [ List(Str) ],
    }))
  }
}
