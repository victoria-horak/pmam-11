namespace Jarvice.CommandProcessor.Interfaces;

public interface ICommandFactory
{
	bool TryGetCommand(string name, out ICommand? command);
	IEnumerable<string> AllCommandNames();
}
