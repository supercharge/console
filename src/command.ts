'use strict'

import { Application } from './application'
import { ArgvInput } from './input/argv-input'
import { tap, upon } from '@supercharge/goodies'
import { InputOption } from './input/input-option'
import { ConsoleOutput } from './io/console-output'
import { CommandContract } from './command-contract'
import { InputArgument } from './input/input-argument'
import { InputArgumentBuilder } from './input/input-argument-builder'
import { InputOptionBuilder } from './input/input-option-builder'
import { InputDefinition } from './input/input-definition'

interface CommandMeta {
  name: string
  description: string | undefined
  application?: Application

  definition: InputDefinition

  output: ConsoleOutput
}

export class Command implements CommandContract {
  /**
   * Store the command meta data.
   */
  private readonly meta: CommandMeta

  /**
   * Create a new command instance.
   *
   * @param {String} name
   */
  constructor (name?: string) {
    this.meta = {
      name: name ?? this.constructor.name,
      description: undefined,

      definition: new InputDefinition(),

      output: new ConsoleOutput()
    }

    this.configure()
  }

  /**
   * Returns the command name.
   *
   * @returns {String}
   */
  getName (): string {
    return this.meta.name
  }

  /**
   * Set the command name.
   *
   * @returns {Command}
   */
  name (name: string): this {
    return tap(this, () => {
      this.meta.name = name
    })
  }

  /**
   * Returns the command description displayed when calling the help overview.
   *
   * @returns {String}
   */
  getDescription (): string {
    return this.meta.description ?? ''
  }

  /**
   * Set the command description
   *
   * @param {String} alias
   *
   * @returns {Command}
   */
  description (description: string): this {
    return tap(this, () => {
      this.meta.description = description
    })
  }

  /**
   * Set the console application instance.
   *
   * @param {Application} application
   *
   * @returns {Command}
   */
  setApplication (application: Application): this {
    return tap(this, () => {
      this.meta.application = application
    })
  }

  /**
   * Returns the console application instance.
   *
   * @returns {Application}
   */
  application (): Application {
    if (!this.meta.application) {
      throw new Error('Missing application instance.')
    }

    return this.meta.application
  }

  /**
   * Returns the input definition containing all registered options and arguments.
   *
   * @returns {InputDefinition}
   */
  definition (): InputDefinition {
    return this.meta.definition
  }

  /**
   * Determine whether this command is enabled. You may override this method in
   * your command and perform checks determining whether it should be enabled
   * or disabled in a given environment or under the given conditions.
   *
   * @returns {Boolean}
   */
  isEnabled (): boolean {
    return true
  }

  /**
   * Configure the command.
   */
  configure (): void {
    /**
     * This method is not abstract because users don’t need to implement it.
     * Sometimes commands can live without extra configuration besides the
     * command name. That’s the reason this method stays empty over here.
     */
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
  addArgument (name: string): InputArgumentBuilder {
    if (!name) {
      throw new Error(`Missing argument name in command ${this.constructor.name}`)
    }

    return upon(new InputArgument(name), argument => {
      this.definition().addArgument(argument)

      return new InputArgumentBuilder(argument)
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
  addOption (name: string): InputOptionBuilder {
    if (!name) {
      throw new Error(`Missing option name in command ${this.constructor.name}`)
    }

    return upon(new InputOption(name), option => {
      this.definition().addOption(option)

      return new InputOptionBuilder(option)
    })
  }

  /**
   * Returns the output interface.
   *
   * @returns {ConsoleOutput}
   */
  io (): ConsoleOutput {
    return this.meta.output
  }

  /**
   * Run the command.
   *
   * The code to run is provided in the `handle` method. This
   * `handle` method must be implemented by subclasses.
   */
  async handle (argv: ArgvInput): Promise<any> {
    const parsed = argv.parse({
      alias: this.optionsWithAliasMapping()
      // default: this.optionsWithDefaultValueMapping()
    })

    try {
      await this.run()
    } catch (error) {
      this.prettyPrint(error)
    }
  }

  private optionsWithAliasMapping (): { [key: string]: string[] } {
    const result: { [key: string]: string[] } = {}

    this.options().forEach((key: string, value: InputOption) => {
      result[key] = value.shortcuts()
    })

    return result
  }

  // private optionsWithDefaultValueMapping (): { [key: string]: string[] } {
  //   const result: { [key: string]: string[] } = {}

  //   this.options().forEach((key: string, value: InputOption) => {
  //     result[key] = value.defaultValue()
  //   })

  //   return result
  // }

  /**
   * Pretty-print the given `error` in the terminal.
   *
   * @param {Error} error
   */
  prettyPrint (error: Error): void {
    this.io()
      .emptyLine()
      .error(error)
      .emptyLine()
  }

  /**
   * Handle an incoming console command for the given `input`.
   *
   * @returns {Promise}
   */
  run (): any | Promise<any> {
    throw new Error(`You must implement the "handle" method in your "${this.getName()}" command`)
  }
}
