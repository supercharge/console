'use strict'

import { Tag } from './tag'
import kleur, { Kleur } from 'kleur'
import { isNullish, tap } from '@supercharge/goodies'

export class ConsoleOutput {
  /**
   * Returns the colors instance.
   *
   * @returns {Kleur}
   */
  colors (): Kleur {
    return kleur
  }

  /**
   * Log an empty line to the console. Useful if you want to create some space to breath.
   *
   * @returns {ConsoleOutput}
   */
  emptyLine (): this {
    return this.log('')
  }

  /**
   * Log the given `message` to the output console using `console.log`.
   *
   * @param message
   *
   * @returns {ConsoleOutput}
   */
  log (message: string): this {
    return tap(this, () => {
      console.log(message)
    })
  }

  /**
   * Log the given `message` to the error console using `console.error`.
   *
   * @param message
   *
   * @returns {ConsoleOutput}
   */
  logError (message: string): this {
    return tap(this, () => {
      console.error(message)
    })
  }

  /**
   * Log a success message with the given `label` and message` to the terminal.
   *
   * @param {String} label
   * @param {String} message
   *
   * @returns {ConsoleOutput}
   */
  success (label: string, message?: string): this {
    if (typeof label === 'string' && isNullish(message)) {
      return this.log(`${this.colors().green(label)}`)
    }

    if (typeof label === 'string' && typeof message === 'string') {
      return this.log(`${this.colors().bgGreen().black(label)}  ${message}`)
    }

    throw new Error('Unsupported input when logging a "success" message.')
  }

  /**
   * Log a hint message with the given `label` and message` to the terminal.
   *
   * @param {String} label
   *
   * @returns {ConsoleOutput}
   */
  hint (label: string, message?: string): this {
    if (typeof label === 'string' && isNullish(message)) {
      return this.log(`${this.colors().blue(label)}`)
    }

    if (typeof label === 'string' && typeof message === 'string') {
      return this.log(`${this.colors().bgBlue().black(label)}  ${message}`)
    }

    throw new Error('Unsupported input when logging a "hint" message.')
  }

  /**
   * Log a fail message with the given `label` and message` to the terminal.
   *
   * @param {String} label
   *
   * @returns {ConsoleOutput}
   */
  fail (label: string, message?: string): this {
    if (typeof label === 'string' && isNullish(message)) {
      return this.logError(`${this.colors().red(label)}`)
    }

    if (typeof label === 'string' && typeof message === 'string') {
      return this.logError(`${this.colors().bgRed().white().bold(label)}  ${message}`)
    }

    throw new Error('Unsupported input when logging a "fail" message.')
  }

  /**
   * Returns a new action for the given `label`.
   *
   * @param {String} label
   *
   * @returns {ConsoleOutput}
   */
  tag (label: string): Tag {
    if (typeof label === 'string') {
      return new Tag(this, label)
    }

    throw new Error(`Unsupported "label" when creating an action. Received: ${typeof label}`)
  }

  /**
   * Log the given warning `info` to the terminal.
   *
   * @param {String} message
   *
   * @returns {ConsoleOutput}
   */
  debug (message: string): this {
    if (typeof message === 'string') {
      return this.hint(' DEBUG ', message)
    }

    throw new Error(`Unsupported input when logging a debug message. Received: ${typeof message}`)
  }

  /**
   * Log the given warning `info` to the terminal.
   *
   * @param {String} message
   *
   * @returns {ConsoleOutput}
   */
  info (message: string): this {
    if (typeof message === 'string') {
      return this.log(`${this.colors().bgCyan().black(' INFO ')}  ${message}`)
    }

    throw new Error(`Unsupported input when logging an info message. Received: ${typeof message}`)
  }

  /**
   * Log the given warning `message` to the terminal.
   *
   * @param {String} message
   *
   * @returns {ConsoleOutput}
   */
  warn (message: string): this {
    if (typeof message === 'string') {
      return this.log(`${this.colors().bgYellow().black(' WARN ')}  ${this.colors().yellow(message)}`)
    }

    throw new Error(`Unsupported input when logging a warning message. Received: ${typeof message}`)
  }

  /**
   * Log the given `error` to the terminal. The `error` can be a string or an error instance.
   *
   * @param {String|Error} error
   *
   * @returns {ConsoleOutput}
   */
  error (error: string | Error): this {
    const prefix = this.colors().bgRed().white(' ERROR ')

    if (typeof error === 'string') {
      return this.fail(prefix, error)
    }

    if (error instanceof Error) {
      return this
        .fail(prefix, error.message)
        .logError(this.formatStack(error.stack))
    }

    throw new Error(`Unsupported input when logging an error. Received: ${typeof error}`)
  }

  /**
   * Returns the a formatted error stack, if available.
   *
   * @param {String} stack
   *
   * @returns {String}
   */
  private formatStack (stack?: string): string {
    if (!stack) {
      return ''
    }

    return stack
      .split('\n')
      .splice(1)
      .map(line => `${this.colors().dim(line)}`)
      .join('\n')
  }
}
