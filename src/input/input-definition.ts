'use strict'

import Set from '@supercharge/set'
import Str from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { InputOption } from './input-option'
import { InputArgument } from './input-argument'

export class InputDefinition {
  /**
   * The input definition meta data.
   */
  private readonly meta: {
    /**
     * Contains the defined input options
     */
    options: Set<InputOption>
    arguments: Set<InputArgument>
  }

  /**
   * Create a new option instance for the given `name`.
   *
   * @param {String} name
   */
  constructor () {
    this.meta = {
      options: new Set(),
      arguments: new Set()
    }
  }

  /**
   * Returns the defined input options.
   *
   * @returns {Map}
   */
  options (): Set<InputOption> {
    return this.meta.options
  }

  /**
   * Returns the input option instance for the given `name`. Returns
   * `undefined` if no input option is defined for the name.
   *
   * @returns {InputOption}
   */
  option (name: string): InputOption | undefined {
    return this.options().find(option => {
      return option.name() === name
    })
  }

  /**
   * Creates a new argument for the given `name` for this command. Returns a
   * builder instance to configure the added argument with fluent methods.
   *
   * @param {String} name
   *
   * @returns {InputArgumentBuilder}
   *
   * @throws
   */
  addOption (option: InputOption): this {
    if (this.hasOption(option.name())) {
      throw new Error(`Option "${option.name()}" is already registered.`)
    }

    option.shortcuts().forEach(shortcut => {
      this.options().forEach(option => {
        if (Str(shortcut).includes(option.shortcuts())) {
          throw new Error(`Shortcut "${shortcut}" is already registered for option "${option.name()}".`)
        }
      })
    })

    return tap(this, () => {
      this.options().add(option)
    })
  }

  /**
   * Determine whether an option with the given `name` exists.
   *
   * @param name
   *
   * @returns {Boolean}
   */
  hasOption (name: string | number): boolean {
    if (Number.isInteger(name)) {
      return !!this.options().toArray()[name as number]
    }

    return this.options().includes(option => {
      return option.name() === name
    })
  }

  /**
   * Determine whether an option with the given `name` does not exist.
   *
   * @param name
   *
   * @returns {Boolean}
   */
  isMissingOption (name: string | number): boolean {
    return !this.hasOption(name)
  }

  /**
   * Returns the defined input arguments.
   *
   * @returns {Map}
   */
  arguments (): Set<InputArgument> {
    return this.meta.arguments
  }

  /**
   * Returns the input argument instance for the given `name`. Returns
   * `undefined` if no input argument is defined for the name.
   *
   * @returns {InputOption}
   */
  argument (name: string): InputArgument | undefined {
    return this.arguments().find(argument => {
      return argument.name() === name
    })
  }

  /**
   * Creates a new argument for the given `name` for this command. Returns a
   * builder instance to configure the added argument with fluent methods.
   *
   * @param {String} name
   *
   * @returns {InputArgumentBuilder}
   *
   * @throws
   */
  addArgument (argument: InputArgument): this {
    if (this.hasArgument(argument.name())) {
      throw new Error(`Option "${argument.name()}" is already registered.`)
    }

    return tap(this, () => {
      this.arguments().add(argument)
    })
  }

  hasArgument (name: string | number): boolean {
    if (Number.isInteger(name)) {
      return !!this.arguments().toArray()[name as number]
    }

    return this.arguments().includes(argument => {
      return argument.name() === name
    })
  }

  isMissingArgument (name: string | number): boolean {
    return !this.hasArgument(name)
  }
}
