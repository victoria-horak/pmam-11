using Jarvice.CommandProcessor.Commands;
using Jarvice.CommandProcessor.Configurations;
using Jarvice.CommandProcessor.Interfaces;
using Jarvice.SpeechService.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Reflection;

namespace Jarvice.CommandProcessor;

public class CommandFactory : ICommandFactory
{
	private readonly ServicesUrls _servicesUrls;
	private readonly Dictionary<string, ICommand> _commands;
	public IEnumerable<string> AllCommandNames() => _commands.Keys;

	public CommandFactory(IFileWorkerService fileWorkerService,
		IDockerWorkerService dockerWorkerService,
		IOptions<ServicesUrls> options,
		IOptions<DockerScripts> dockerScripts,
		IHostApplicationLifetime appLifetime,
		ISpeechService speechService)
	{
		_servicesUrls = options.Value;
		_commands = new Dictionary<string, ICommand>(StringComparer.OrdinalIgnoreCase);

		var serviceProperties = _servicesUrls.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);

		foreach (var prop in serviceProperties)
		{
			var path = prop.GetValue(_servicesUrls)?.ToString();
			if (!string.IsNullOrEmpty(path))
			{
				var commandName = "open " + ToSpacedWords(prop.Name) + " service";
				_commands[commandName] = new OpenServiceCommand(commandName, path, fileWorkerService);

				var closeCommandName = "close " + ToSpacedWords(prop.Name) + " service";
				_commands[closeCommandName] = new CloseServiceCommand(closeCommandName, path, fileWorkerService);
			}
		}

		_commands["restart docker services"] = new RestartDockerServicesCommand(dockerWorkerService, dockerScripts);
		_commands["reload docker services"] = new ReloadDockerServicesCommand(dockerWorkerService, dockerScripts);
		_commands["turn off the app"] = new TurnOffCommand(appLifetime, speechService);
	}

	public bool TryGetCommand(string name, out ICommand? command) =>
		_commands.TryGetValue(name, out command);

	private string ToSpacedWords(string text)
	{
		return System.Text.RegularExpressions.Regex.Replace(text, "(\\B[A-Z])", " $1").ToLower();
	}
}
